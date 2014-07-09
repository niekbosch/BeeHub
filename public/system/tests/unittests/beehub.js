/*
 * Copyright ©2013 SURFsara bv, The Netherlands
 *
 * This file is part of js-webdav-client.
 *
 * js-webdav-client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * js-webdav-client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with js-webdav-client.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

(function(){
  module( "beehub", {
    teardown: function() {
      // clean up after each test
      backToOriginalEnvironment();
    }
  });
  
  var backToOriginalEnvironment = function(){
  };
  
  /**
   * Test bytesToSize
   * 
   */
  test('nl.sara.beehub.utils.bytesToSize', function(){
    expect(6);
    
    deepEqual( nl.sara.beehub.utils.bytesToSize(0, 2), "0 B", "0 bytes, precision 2");
    deepEqual( nl.sara.beehub.utils.bytesToSize(500, 2), "500 B", "500 bytes, precision 2");
    deepEqual( nl.sara.beehub.utils.bytesToSize(1500, 2), "1.46 KB", "1500 bytes, precision 2");
    deepEqual( nl.sara.beehub.utils.bytesToSize(15000000, 2), "14.31 MB", "15000000 bytes, precision 2");
    deepEqual( nl.sara.beehub.utils.bytesToSize(15000000000, 1), "14.0 GB", "15000000000 bytes, precision 1");
    deepEqual( nl.sara.beehub.utils.bytesToSize(15000000000000, 0), "14 TB", "15000000000000 bytes, precision 0");
  });
  
  test('TODO-write tests for BeeHub File', function(){
    ok(false,"TODO-write tests for beehub.js");
    ok(false,"TODO-write tests for Content view: handle_sponsor_click");
    ok(false,"TODO-write tests for nl.sara.beehub.view.content.setSponsorDropdown");
    ok(false,"TODO-write tests for nl.sara.beehub.view.content.errorGetSponsors");
    ok(false,"TODO-write tests for nl.sara.beehub.view.content.setNewSponsor");
    ok(false,"TODO-write tests for nl.sara.beehub.view.content.errorNewSponsor");
  });
})();