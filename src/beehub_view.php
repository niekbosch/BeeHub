<?php

/*·************************************************************************
 * Copyright ©2007-2012 Pieter van Beek, Almere, The Netherlands
 *         <http://purl.org/net/6086052759deb18f4c0c9fb2c3d3e83e>
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
 * Some class.
 * @package BeeHub
 */
class BeeHub_View {
  private $viewPath;
  private $vars;

  public function __construct($viewPath) {
    $viewPath = realpath($viewPath);
    if (is_readable($viewPath)) {
      $this->viewPath = $viewPath;
    }else{
      throw new Exception('View path does not exist');
    }
  }

  public function setVar($name, $value) {
    if (!is_string($name)) {
      throw new Exception('View variable name should be a string');
    }
    $this->vars[$name] = $value;
    return $this;
  }

  public function parseView() {
    foreach ($this->vars as $name => $value) {
      $$name = $value;
    }
    require($this->viewPath);
  }

  public function getParsedView() {
    ob_start();
    $this->parseView();
    $parsedView = ob_get_contents();
    ob_end_clean();
    return $parsedView;
  }
}

//  End of file
