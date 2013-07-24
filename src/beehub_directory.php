<?php

/*·************************************************************************
 * Copyright ©2007-2012 SARA b.v., Amsterdam, The Netherlands
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at <http://www.apache.org/licenses/LICENSE-2.0>
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **************************************************************************/

/**
 * File documentation (who cares)
 * @package BeeHub
 */

/**
 * Interface to a folder.
 * @package BeeHub
 */
class BeeHub_Directory extends BeeHub_XFSResource implements DAV_Collection {


/**
 * Constructor.
 * @param string $path
 */
public function __construct($path) {
  parent::__construct(DAV::slashify($path));
}


//public function user_prop_getcontentlength() { return 4096; }


public function create_member( $name ) {
  return $this->internal_create_member( $name );
}


private function internal_create_member( $name, $collection = false ) {
  $this->assert(DAVACL::PRIV_WRITE);
  $path = $this->path . $name;
  $localPath = BeeHub::localPath( $path );
  $cups = $this->current_user_principals();

  // Determine the sponsor
  $user = BeeHub_Auth::inst()->current_user();
  $user_sponsors = $user->prop(BeeHub::PROP_SPONSOR_MEMBERSHIP);
  if (count($user_sponsors) == 0) { // If the user doesn't have any sponsors, he/she can't create files and directories
    throw DAV::forbidden();
  }
  $sponsor = $this->prop(BeeHub::PROP_SPONSOR); // The default is the directory sponsor
  if (!in_array($sponsor, $user_sponsors)) { //But a user can only create files sponsored by his own sponsors
    $sponsor = $user->user_prop(BeeHub::PROP_SPONSOR);
  }

  // Create the subdirectory or file
  if (file_exists($localPath))
    throw DAV::forbidden();
  $result = $collection ? @mkdir($localPath) : touch($localPath);
  if ( !$result )
    throw new DAV_Status(DAV::HTTP_INTERNAL_SERVER_ERROR);

  // And set the attributes
  $new_resource = BeeHub_Registry::inst()->resource($path);
  $new_resource->user_set( DAV::PROP_GETETAG, BeeHub::ETag() );
  $new_resource->user_set( DAV::PROP_OWNER, $this->user_prop_current_user_principal() );
  $new_resource->user_set( BeeHub::PROP_SPONSOR, $sponsor );
  $new_resource->storeProperties();
  return $new_resource;
}


public function method_COPY( $path ) {
  $parent = BeeHub_Registry::inst()->resource(dirname($path));
  if (!$parent)
    throw new DAV_Status(DAV::HTTP_CONFLICT, 'Unable to COPY to unexisting collection');
  if (!$parent instanceof BeeHub_Directory)
    throw new DAV_Status(DAV::HTTP_FORBIDDEN);
  $parent->internal_create_member(basename($path), true);
  
  // And copy the attributes
  $new_resource = BeeHub_Registry::inst()->resource( $path );
  foreach( $this->stored_props as $prop => $value ) {
    if ( !in_array( $prop, array(
          DAV::PROP_GETETAG,
          DAV::PROP_OWNER,
          BeeHub::PROP_SPONSOR,
          DAV::PROP_ACL,
          DAV::PROP_LOCKDISCOVERY
          ) ) ) {
      $new_resource->user_set( $prop, $value );
    }
  }
  $new_resource->storeProperties();
}


public function method_DELETE( $name )
{
  $path = $this->path . $name;
  
  // Remove the entry from mongoDB too
  $filesCollection = BeeHub::getNoSQL()->selectCollection( 'files' );
  $filesCollection->remove( array( 'path' => $path ) );

  // And then from the filesystem
  $localpath = BeeHub::localPath( $path );
  $this->assert(DAVACL::PRIV_WRITE);
  if (is_dir($localpath)) {
    if (!@rmdir($localpath))
      throw new DAV_Status(DAV::HTTP_CONFLICT, 'Unable to DELETE resource: ' . $name);
  }
  else {
    if (!@unlink($localpath))
      throw new DAV_Status(DAV::HTTP_INTERNAL_SERVER_ERROR);
  }
  
  BeeHub_Registry::inst()->forget($path);
}


/**
 * @return string an HTML file
 * @see DAV_Resource::method_GET()
 */
public function method_GET() {
  $this->assert(DAVACL::PRIV_READ);

  # TODO oops, the document isn't generated as a stream? Here, an object is
  # created for each member resource, and stored in memory. This will crash
  # the server for large directories!
  # It would be nicer if these objects were created one at a time, and then
  # forgotten.
  # @see BeeHub::Registry::forget()
  $members = array();
  foreach ($this as $member){
    $members[$member] = BeeHub_Registry::inst()->resource($this->path . $member);
  }
  $this->include_view( null, array(
      'members' => $members,
      'CONFINED_BOOTSTRAP' => true
  ));
}


public function method_HEAD() {
  $retval = parent::method_HEAD();
  $retval['Cache-Control'] = 'no-cache';
  return $retval;
}

/**
 * @param string $name
 * @throws DAV_Status
 */
public function method_MKCOL( $name ) {
  return $this->internal_create_member( $name, true );
}


public function method_MOVE( $member, $destination ) {
  $this->assert(DAVACL::PRIV_WRITE);
  BeeHub_Registry::inst()->resource(dirname($destination))->assert(DAVACL::PRIV_WRITE);
  $localDest = BeeHub::localPath($destination);
  rename(
    BeeHub::localPath( $this->path . $member ),
    $localDest
  );
}


/**
 * @var DirectoryIterator
 */
private $dir = null;


/**
 * @return DirectoryIterator
 */
private function dir() {
  if (is_null($this->dir)) {
    $this->dir = new DirectoryIterator( $this->localPath );
    $this->skipInvalidMembers();
  }
  return $this->dir;
}


private function skipInvalidMembers() {
  while (
    $this->dir()->valid() && (
      $this->dir()->isDot() ||
      !BeeHub_Registry::inst()->resource(
        $this->path . $this->current()
      )->isVisible()
  ) ) {
    BeeHub_Registry::inst()->forget(
      $this->path . $this->current()
    );
    $this->dir->next();
  }
}


public function current() {
  $retval = rawurlencode($this->dir()->getFilename());
  if ('dir' == $this->dir()->getType())
    $retval .= '/';
  return $retval;
}
public function key()     { return $this->dir()->key(); }
public function next()    {
  $this->dir()->next();
  $this->skipInvalidMembers();
}
public function rewind()  {
  $this->dir()->rewind();
  $this->skipInvalidMembers();
}
public function valid()   { return $this->dir()->valid(); }


} // class BeeHub_Directory
