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
 * Collection of sponsors
 * @package BeeHub
 */
class BeeHub_Sponsors extends BeeHub_Principal_Collection {


  /**
   * @see BeeHub_Principal_Collection::report_principal_search_property_set()
   */
  public function report_principal_search_property_set() {
    return array();
  }


  /**
   * @see DAVACL_Principal_Collection::report_principal_property_search()
   */
  public function report_principal_property_search ($input) {
    throw new DAV_Status(
      DAV::HTTP_BAD_REQUEST,
      'You\'re searching for a property which cannot be searched.'
    );
  }


  /**
   * @return string an HTML file
   * @see DAV_Resource::method_GET()
   */
  public function method_GET() {
    $sponsors = array();
    foreach ($this as $sponsor)
      $sponsors[] = DAV::$REGISTRY->resource( $this->path . $sponsor );
    $this->include_view(null, array('sponsors' => $sponsors));
  }


  /**
   * Through a POST request you can create new sponsors
   * 
   * @param   array  $headers  The HTTP headers
   * @throws  DAV_Status
   * @see DAV_Resource::method_POST()
   */
  public function method_POST( &$headers ) {
    $displayname = $_POST['displayname'];
    $description = $_POST['description'];
    $sponsor_name = $_POST['sponsor_name'];
    
    // Only administrators can add a sponsor
    if ( ! DAV::$ACLPROVIDER->wheel() ) {
      throw DAV::forbidden("Only administrators are allowed to create sponsors");
    }
    // Sponsor name must be one of the following characters a-zA-Z0-9_-., starting with an alphanumeric character and must be between 1 and 255 characters long
    if ( empty($displayname) ||
         !preg_match( '/^[a-zA-Z0-9]{1}[a-zA-Z0-9_\-\.]{0,254}$/D', $sponsor_name ) ) {
      throw new DAV_Status( DAV::HTTP_BAD_REQUEST, 'Sponsor name has the wrong format. The name can be a maximum of 255 characters long and should start with an alphanumeric character, followed by alphanumeric characters or one of the following: _-.' );
    }

    // Store in the database
    try {
      $statement = BeeHub_DB::execute(
        'INSERT INTO `beehub_sponsors` (`sponsor_name`) VALUES (?)',
        's', $sponsor_name
      );
    }catch ( Exception $exception ) {
      if ( $exception->getCode() === 1062 ) { // Duplicate key: bad request!
        throw new DAV_Status( DAV::HTTP_CONFLICT, "Sponsor name already exists, please choose a different sponsor name!" );
      }else{
        throw new DAV_Status( DAV::HTTP_INTERNAL_SERVER_ERROR );
      }
    }

    // Fetch the sponsor and store extra properties
    $sponsor = DAV::$REGISTRY->resource( BeeHub::SPONSORS_PATH . $sponsor_name );
    $sponsor->user_set( DAV::PROP_DISPLAYNAME, $displayname );
    if ( ! empty( $description ) ) {
      $sponsor->user_set( BeeHub::PROP_DESCRIPTION, $description );
    }
    $sponsor->storeProperties();

    // Add the current user as admin of the sponsor
    $sponsor->change_memberships(
      array( basename( $this->user_prop_current_user_principal() ) ),
      true, true
    );

    // Sponsor created, redirect to the sponsor page
    DAV::redirect(
      DAV::HTTP_SEE_OTHER,
      BeeHub::SPONSORS_PATH . rawurlencode( $sponsor->name )
    );
  }


  protected function init_members() {
    $stmt = BeeHub_DB::execute(
      'SELECT `sponsor_name`
       FROM `beehub_sponsors`
       ORDER BY `displayname`'
    );
    $this->members = array();
    while ($row = $stmt->fetch_row()) {
      $this->members[] = rawurlencode($row[0]);
    }
    $stmt->free_result();
  }


}// class BeeHub_Sponsors
