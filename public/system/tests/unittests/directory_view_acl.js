  /*
 * Copyright ©2014 SURFsara bv, The Netherlands
 *
 * This file is part of the BeeHub webclient.
 *
 * BeeHub webclient is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BeeHub webclient is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with BeeHub webclient.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

(function(){
  var currentDirectory =      "/foo/client_tests/";
  var addButton =             '.bh-dir-acl-add';
  var directoryView =         '#bh-dir-acl-directory-acl';
  var addAclButton=           '#bh-dir-acl-directory-button';
  var aclFormView=            '#bh-dir-acl-directory-form';
  var indexLastProtected=     0;

  
  var aclContents =           '.bh-dir-acl-contents';
  var aclRow =                '.bh-dir-acl-row';
  var aclComment =            '.bh-dir-acl-comment';
  var aclChangePermissions =  '.bh-dir-acl-change-permissions';
  var aclPermissionsField =   '.bh-dir-acl-permissions';
  var aclPermissionsSelect =  '.bh-dir-acl-permissions-select';
  var aclPermissions =        '.bh-dir-acl-table-permissions';
  var aclUpIcon =             '.bh-dir-acl-icon-up';
  var aclDownIcon =           '.bh-dir-acl-icon-down';
  var aclRemoveIcon =         '.bh-dir-acl-icon-remove';
  var aclPrincipal =          '.bh-dir-acl-principal';

  module("view acl",{
    setup: function(){
      // Call init function
      nl.sara.beehub.view.acl.init();
    }
  });
  
  /**
   * Check if row handlers are set
   * 
   * @param {Array} rows  Array with rows to check
   */
  var checkSetRowHandlers = function(rows){
    // Remember values
    var permissions = "";
    var permissionsOld = "";
    var aclPermissionsFieldShow = true;
    var aclPermissionsSelectShow = false;
    var rowIndex = 0;

    // Rewrite functions
    var rememberChangePermissions = nl.sara.beehub.view.acl.changePermissions;
    nl.sara.beehub.view.acl.changePermissions = function(row, val){
      deepEqual(val, permissions, "Permissions should be "+permissions);
    };
    
    var rememberChangePermissionsController = nl.sara.beehub.controller.changePermissions;
    nl.sara.beehub.controller.changePermissions = function(row, oldVal) {
      deepEqual(oldVal, permissionsOld, "Old permissions should be "+permissionsOld);
    }
    
    var rememberShowChangePermissions = nl.sara.beehub.view.acl.showChangePermissions;
    nl.sara.beehub.view.acl.showChangePermissions = function(row, show) {
      if (show) {
        $(row).find(aclPermissionsField).hide();
        $(row).find(aclPermissionsSelect).show();
        deepEqual($(row).find(aclPermissionsField).is(':hidden'), aclPermissionsFieldShow, 'Permissions field should be hidden');
        deepEqual($(row).find(aclPermissionsSelect).is(':hidden'), aclPermissionsSelectShow, 'Permissions select should be shown');
      } else {
        $(row).find(aclPermissionsField).show();
        $(row).find(aclPermissionsSelect).hide();
        deepEqual($(row).find(aclPermissionsField).is(':hidden'), aclPermissionsFieldShow, 'Permissions field should be shown');
        deepEqual($(row).find(aclPermissionsSelect).is(':hidden'), aclPermissionsSelectShow, 'Permissions select should be hidden');
      }
    }
    
    var rememberMaskView =  nl.sara.beehub.controller.maskView;
    nl.sara.beehub.controller.maskView = function(value, bool) {
      ok(true, "Mask view is called");
    }
    
    var rememberUpAclRule = nl.sara.beehub.view.acl.moveUpAclRule;
    nl.sara.beehub.view.acl.moveUpAclRule = function(row){
      if ((row !== undefined) && ($(row).index() === rowIndex)) {
        ok(true, "Move up acl is called with the right row object");
      } else {
        ok(false, "Move up acl is called with no row or the wrong row index");
      }
    };
    
    var rememberMoveUpAclRuleController = nl.sara.beehub.controller.moveUpAclRule;
    nl.sara.beehub.controller.moveUpAclRule = function(row, t){
      if ((row !== undefined) && (t !== undefined) && ($(row).index() === rowIndex)) {
        ok(true, "Move up acl controller is called with the right row object");
      } else {
        ok(false, "Move up acl controller is called but row object or time object is wrong or undefined");
      }
    }
    
    var rememberDownAclRule = nl.sara.beehub.view.acl.moveDownAclRule;
    nl.sara.beehub.view.acl.moveDownAclRule = function(row){
      if ((row !== undefined) && ($(row).index() === rowIndex)) {
        ok(true, "Move down acl is called with the right row object");
      } else {
        ok(false, "Move down acl is called with no row or the wrong row index");
      }
    };
    
    var rememberMoveDownAclRuleController = nl.sara.beehub.controller.moveDownAclRule;
    nl.sara.beehub.controller.moveDownAclRule = function(row, t){
      if ((row !== undefined) && (t !== undefined) && ($(row).index() === rowIndex)) {
        ok(true, "Move down acl controller is called with the right row object");
      } else {
        ok(false, "Move down acl controller is called but row object or time object is wrong or undefined");
      }
    }
    
    var rememberDeleteRowIndex = nl.sara.beehub.view.acl.deleteRowIndex;
    nl.sara.beehub.view.acl.deleteRowIndex = function(index){
      if ((index !== undefined) && (index === rowIndex)){
        ok(true, "Delete row is called with the right index");
      } else {
        ok(false, "Delete row is called but index is undefined or wrong");
      }
    };
    
    var rememberDeleteAclRuleController = nl.sara.beehub.controller.deleteAclRule;
    nl.sara.beehub.controller.deleteAclRule = function(row, index, t){
      if ((index !== undefined) && (index === rowIndex) && (t !== undefined)){
        ok(true, "Delete row controller is called with the right index");
      } else {
        ok(false, "Delete row controller is called but index is undefined or wrong");
      }
    };
    
    $.each(rows, function(key, row) {
      var info = $(row).find(aclComment).attr('name');
      if (info !== 'protected' && info !== 'inherited') {
        rowIndex = $(row).index();
        // Change permissions handler
        aclPermissionsFieldShow = true;
        aclPermissionsSelectShow = false;
        $(row).find(aclChangePermissions).click();
       
        // check focus
        deepEqual($(row).find(aclPermissions).is(':focus'), true, 'Mouse should be focused in select field');
        
        // Check change handler
        permissionsOld = $(row).find(aclPermissionsField).html();
        aclPermissionsFieldShow = false;
        aclPermissionsSelectShow = true;
        if ($(row).find(aclPermissions).prop("selectedIndex") !== 0) {
          permissions = "allow read";
          $(row).find(aclPermissions).prop("selectedIndex",0);
          $(row).find(aclPermissions).change();
        } else {
          permissions = "allow read, write";
          $(row).find(aclPermissions).prop("selectedIndex",1);
          $(row).find(aclPermissions).change();
        }; 
        // Check blur handler
        aclPermissionsFieldShow = true;
        aclPermissionsSelectShow = false;
        $(row).find(aclChangePermissions).click();
        aclPermissionsFieldShow = false;
        aclPermissionsSelectShow = true;
        $(row).find(aclPermissions).blur();
        
        // Check up icon handler
        $(row).find(aclUpIcon).click();
        
        // Check down icon handler
        $(row).find(aclDownIcon).click();
        
        // Check delete icon handler
        $(row).find(aclRemoveIcon).click();
      };
    });
    
    // Back to original environment
    nl.sara.beehub.view.acl.changePermissions = rememberChangePermissions;
    nl.sara.beehub.controller.changePermissions = rememberChangePermissionsController;
    nl.sara.beehub.view.acl.showChangePermissions = rememberShowChangePermissions;
    nl.sara.beehub.controller.maskView = rememberMaskView;
    nl.sara.beehub.view.acl.moveUpAclRule = rememberUpAclRule;
    nl.sara.beehub.controller.moveUpAclRule = rememberMoveUpAclRuleController;
    nl.sara.beehub.view.acl.moveDownAclRule = rememberDownAclRule;
    nl.sara.beehub.controller.moveDownAclRule = rememberMoveDownAclRuleController;
    nl.sara.beehub.view.acl.deleteRowIndex = rememberDeleteRowIndex;
    nl.sara.beehub.controller.deleteAclRule = rememberDeleteAclRuleController;
  };
  
  /**
   * Test a row that is created
   * 
   * @param {DOM object}    row   Row to test
   * @param {object}        ace   ace used to create the row
   */
  var testCreatedRow = function(row, ace, up, down, remove){
    // Principal
    var principal = row.find(aclPrincipal).attr('title');
    var invert = row.find(aclPrincipal).attr('data-invert');
    var name = row.find(aclPrincipal).attr('name');
    deepEqual(principal, ace.principal, "Principal title should be "+ace.principal);
    deepEqual(invert, ace.invert, "Data invert should be "+ace.invert);
    deepEqual(name, ace.principal, "Name should be "+ace.principal);
    
    // Hidden select
    var select = true;
    if (row.find(aclPermissionsSelect) === undefined){
      select = false;
    }
    deepEqual(select, true, "Hidden select field is created");

    // Permissions
    var title = row.find(aclPermissionsField).attr('title');
    deepEqual(title, ace.permissions, "Hidden select field is created");
    var presentation = row.find(aclPermissionsField).find(".presentation").html();
    deepEqual(presentation, ace.permissions, "Presentation of permissions is ok");
    
    // Comment
    var comment = row.find(aclComment).attr('name');
    var iconDown = row.find(aclDownIcon);
    if (ace.protected){
      deepEqual(comment, "protected", "Info should be protected");
    } else { 
      if (ace.inherited) {
        deepEqual(comment, "inherited", "Info should be inherited");
      } else {
        deepEqual(comment, "", "Info should be empty string");
      }
    }
    // Icon up
    if (row.find(aclUpIcon).html() !== undefined){
      deepEqual(true, up, "Up icon should be visible.");
    } else {
      deepEqual(false, up, "Up icon should not be visible.");
    };
    
    // Icon down
    if (row.find(aclDownIcon).html() !== undefined){
      deepEqual(true, down, "Down icon should be visible.");
    } else {
      deepEqual(false, down, "Down icon should not be visible.");
    };
    
    // Icon delete
    if (row.find(aclRemoveIcon).html() !== undefined){
      deepEqual(true, remove, "Delete icon should be visible.");
    } else {
      deepEqual(false, remove, "Delete icon should not be visible.");
    };
  }
  
  /**
   * Test if view is set
   */
  test( 'nl.sara.beehub.view.acl.init: Set view', function() {
    expect( 3 );  
    
    var rememberSetTableSort = nl.sara.beehub.view.acl.setTableSorter;
    nl.sara.beehub.view.acl.setTableSorter = function(input){
      deepEqual(input.length,1,"Table sorter is called");
    }
    
    // Call init function
    nl.sara.beehub.view.acl.init();
    
    // View is set
    deepEqual(nl.sara.beehub.view.acl.getViewPath(), currentDirectory, "View path should be "+currentDirectory );
    deepEqual(nl.sara.beehub.view.acl.getView(), "directory", "View should be directory");
    
    nl.sara.beehub.view.acl.setTableSorter = rememberSetTableSort;
  });
  
  /**
   * Test if add button handler is set
   */
  test( 'nl.sara.beehub.view.acl.init: Set view add button', function() {
    expect( 1 );  
 
    var rememberAddAclRule = nl.sara.beehub.controller.addAclRule;
    nl.sara.beehub.controller.addAclRule = function(){
      ok(true, "Add acl button click handler is set");
    };
    
    // Call init function
    nl.sara.beehub.view.acl.init();
    
    $(addButton).click();
    
    nl.sara.beehub.controller.addAclRule = rememberAddAclRule;
  });
  
  /**
   * Test if row handlers are set
   */
  test( 'nl.sara.beehub.view.acl.init: Set view row handlers', function() {
    expect( 54 ); 
    var rows = nl.sara.beehub.view.acl.getAclView().find(aclContents).find(aclRow);
    checkSetRowHandlers(rows);
  });
  
  /**
   * Test setView, getViewPath and getView
   */
  test( 'nl.sara.beehub.view.acl.setView, getViewPath, getView', function() {
    expect( 2 ); 
    // Remember old value
    var view = nl.sara.beehub.view.acl.getView();
    var path = nl.sara.beehub.view.acl.getViewPath();
    
    nl.sara.beehub.view.acl.setView("test","/testpath");
    // View is set
    deepEqual(nl.sara.beehub.view.acl.getViewPath(), "/testpath", "View path should be /testpath" );
    deepEqual(nl.sara.beehub.view.acl.getView(), "test", "View should be test");
  
    // Back to original
    nl.sara.beehub.view.acl.setView(view, path);
  });
  
  /**
   * Test getAclView
   */
  test( 'nl.sara.beehub.view.acl.getAclView', function() {
    expect( 1 ); 
    deepEqual(nl.sara.beehub.view.acl.getAclView().attr("id"), directoryView.replace("#",""), "Acl view id should be "+directoryView.replace("#","") );
  });
  
  /**
   * Test getAddAclButton
   */
  test( 'nl.sara.beehub.view.acl.getAddAclButton', function() {
    expect( 1 ); 
    deepEqual(nl.sara.beehub.view.acl.getAddAclButton().attr("id"), addAclButton.replace("#",""), "Add acl button id should be "+addAclButton.replace("#","") );
  });
  
  /**
   * Test getFormView
   */
  test( 'nl.sara.beehub.view.acl.getFormView', function() {
    expect( 1 ); 
    $('#qunit-fixture').append('<div id="'+aclFormView.replace("#","")+'"></div>')
    deepEqual(nl.sara.beehub.view.acl.getFormView().attr("id"), aclFormView.replace("#",""), "Add acl button id should be "+aclFormView.replace("#","") );
  });
  
  /**
   * Test allFixedButtons
   */
  test( 'nl.sara.beehub.view.acl.allFixedButtons', function() {
    expect( 2 ); 
    nl.sara.beehub.view.acl.allFixedButtons('hide');
    deepEqual($(addAclButton).is(':hidden'), true, 'Add acl button should be hidden');
    nl.sara.beehub.view.acl.allFixedButtons('show');
    deepEqual($(addAclButton).is(':hidden'), false, 'Add acl button should be shown');

  });
  
  /**
   * Test addRow and createRow
   */
  test( 'nl.sara.beehub.view.acl.addRow,createRow', function() {
    expect( 40 ); 
    
    // Test createRow after last protected
    var ace = {
        'principal' :   "test_principal", 
        'permissions':  "allow read, write", 
        'invert':       "true",
    };
    var createdRow = nl.sara.beehub.view.acl.createRow(ace);
    nl.sara.beehub.view.acl.addRow(createdRow, nl.sara.beehub.view.acl.getIndexLastProtected());
    var table = nl.sara.beehub.view.acl.getAclView().find(aclContents);
    var row = table.find('tr').find('td').filter("[name='test_principal']").parent();
    testCreatedRow(row, ace, false, true, true);
    
    // Test createRow with inherited ace
    var ace2 = {
        'principal' :   "test2_principal", 
        'permissions':  "allow read", 
        'invert':       "false",
        'inherited':    true
    };
    
    var createdRow2 = nl.sara.beehub.view.acl.createRow(ace2);
    var index = nl.sara.beehub.view.acl.getAclView().find(aclContents).find('tr').length;
    nl.sara.beehub.view.acl.addRow(createdRow2, index-1);
    var table2 = nl.sara.beehub.view.acl.getAclView().find(aclContents);
    var row2 = table2.find('tr').find('td').filter("[name='test2_principal']").parent();
    testCreatedRow(row2, ace2, false, false, false);
    
    // Test createRow with protected ace
    var ace3 = {
        'principal' :   "test3_principal", 
        'permissions':  "allow read", 
        'invert':       "false",
        'protected':    true
    };
    
    // Test create row with up and down icons
    var createdRow3 = nl.sara.beehub.view.acl.createRow(ace3);
    nl.sara.beehub.view.acl.addRow(createdRow3, 0);
    var table3 = nl.sara.beehub.view.acl.getAclView().find(aclContents);
    var row3 = table3.find('tr').find('td').filter("[name='test3_principal']").parent();
    testCreatedRow(row3, ace3, false, false, false);
    
    var ace4 = {
        'principal' :   "test4_principal", 
        'permissions':  "deny read, write, change acl", 
        'invert':       "false"
    };
    
    var createdRow4 = nl.sara.beehub.view.acl.createRow(ace4);
    nl.sara.beehub.view.acl.addRow(createdRow4, nl.sara.beehub.view.acl.getIndexLastProtected()+1);
    var table4 = nl.sara.beehub.view.acl.getAclView().find(aclContents);
    var row4 = table4.find('tr').find('td').filter("[name='test4_principal']").parent();
    testCreatedRow(row4, ace4, true, true, true);
  });
  
  /**
   * Test getIndexLastProtected
   */
  test('nl.sara.beehub.view.acl.getIndexLastProtected', function(){
    expect( 1 );
    var index = nl.sara.beehub.view.acl.getIndexLastProtected();
    deepEqual(index, indexLastProtected, 'Index last protected should be '+indexLastProtected);
  });
})();
// End of file