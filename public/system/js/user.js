/**
 * Copyright ©2013 SURFsara bv, The Netherlands
 *
 * This file is part of the beehub client
 *
 * beehub client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * beehub-client is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with beehub.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Laura Leistikow (laura.leistikow@surfsara.nl)
 */

"use strict";

$(function (){
	/*
	 * Action when submit button in profile tab is clicked.
	 */
   var old_sponsor_value = $('#sponsor').val();
	 $('#myprofile_form').submit(function(event) {
		event.preventDefault();
	   
		var setProps = new Array();
		
		var email = new nl.sara.webdav.Property();
	    email.namespace = 'http://beehub.nl/';
	    email.tagname = 'email';
	    email.setValueAndRebuildXml($('input[name="email"]').val());
	    setProps.push(email);
	    
	    var displayname = new nl.sara.webdav.Property();
	    displayname.namespace = 'DAV:';
	    displayname.tagname = 'displayname';
	    displayname.setValueAndRebuildXml($('input[name="displayname"]').val());
	    setProps.push(displayname);
	    
      if ( $('#sponsor').val() !== old_sponsor_value ) {
  	    var sponsor = new nl.sara.webdav.Property();
  	    sponsor.namespace = 'http://beehub.nl/'; 
  	    sponsor.tagname = 'sponsor';
  	    sponsor.setValueAndRebuildXml($('#sponsor').val()); 
  	    setProps.push(sponsor);
      }
	    
	    var client = new nl.sara.webdav.Client();
	    client.proppatch(location.pathname, function(status, data) {
	    	//TODO check voor elke property
	    	if (status === 207) {
	    		alert( "Your profile is changed!" );
	    		$('#verify_password').val("");
	    		$('#verification_code').val("");
          location.reload();
	    	} else {
	    		alert( "Something went wrong. Your profile is not updated!" );
	    	}
	    }, setProps);
	   
	 }); // End of submit myprofile_form listener
	 
	var passwordListener = function(passwordConfirmationField){
		// clear error
		passwordConfirmationField.next().remove();
		passwordConfirmationField.parent().parent().removeClass('error');
		
		var showError = function(error){
			passwordConfirmationField.parent().parent().addClass('error');
			var errorSpan = $('<span class="help-inline"></span>');
      errorSpan.text( error );
			passwordConfirmationField.parent().append( errorSpan );
		};
		
		if(passwordConfirmationField.val() !== $('#new_password').val()) {
			showError('Password mismatch.');
			return false;
		};
		return true;
	};

	/*
	* Action when the password field will change
	*/
	$('#new_password2').change(function (e) {
		 passwordListener($(this));
	});
	
		/*
	* Action when the password field will change
	*/
	$('#password').change(function () {
		// clear error
		$(this).next().remove();
		$(this).parent().parent().removeClass('error');
	});
	
	/*
	* Action when the change password button is clicked
	*/
	$('#change-password').submit(function (e) {
		 e.preventDefault();
		 var client = new nl.sara.webdav.Client();
		    client.post(location.pathname, function(status, data) {
		    	if (status===200) {
		    		// TODO check if user is logged on with SURFconext.
		    		alert("Your password is changed now!");
		    		$('#change-password').each (function(){
		    			  this.reset();
		    		});
		    	}
		    	if (status===403) {
		    		$("#password").parent().parent().addClass('error');
					var error = $( '<span class="help-inline"></span>' );
          error.text( 'Wrong password.' );
					$("#password").parent().append(error);
		    	};
		    }, $("#change-password").serialize());
	});
	
	/*
	* Action when the unlink button is clicked
	*/
	$('#unlink').click(function (event) {
	    var delProps;
	    if (confirm('Are you sure you want to unlink your SURFconext account?')) {
	      delProps = new Array();
	      
	      var saml_unlink = new nl.sara.webdav.Property();
	      saml_unlink.namespace = 'http://beehub.nl/';
	      saml_unlink.tagname = 'surfconext-description';
	      delProps.push(saml_unlink);
	      
	      saml_unlink = new nl.sara.webdav.Property();
	      saml_unlink.namespace = 'http://beehub.nl/';
	      saml_unlink.tagname = 'surfconext';
	      delProps.push(saml_unlink);
	      
	      var client = new nl.sara.webdav.Client();
		    client.proppatch(location.pathname, function(status, data) {
		    var notlinked = $('<br/> <h5>Your BeeHub account is not linked to a SURFconext account.</h5>'+
		    		'<p><a type="button" href="/system/saml_connect.php" class="btn btn-success">Link SURFconext account</a></p>');
		    $('#surfconext_linked').remove();
		    $('#surfconext').append(notlinked);
		    }, undefined ,delProps);
	    };
	});
	
	/*
	* Action when the verify email button is clicked
	*/
	$('#verify_email').submit(function (e) {
		 e.preventDefault();
		 var client = new nl.sara.webdav.Client();
		    client.post(location.pathname, function(status, data) {
		    	if (status===200) {
			    	location.reload();
		    	}else if (status===403) {
		    		alert( "Wrong verification code or password mismatch!" );
		    	} else {
		    		alert( "Something went wrong. Your email is not verified.!" );
		    	};
		    }, $("#verify_email").serialize());
	});
	
 // Usage tab
 $('a[href="#bh-profile-panel-usage"]').unbind('click').click(function(e){
   createView(); 
 });
 
 var totalSize;

// var createView = function(){
//  $("#bh-profile-usage-graph").html("");
//  totalSize = 0;
//  
//  var width = 640,
//  height = 450,
//  radius = Math.min(width, height) / 2,
//  color = d3.scale.category20c();
//
//  var svg = d3.select("#bh-profile-usage-graph").append("svg")
//    .attr("width", width)
//    .attr("height", height)
//    .append("g")
//    .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");
//
//  var partition = d3.layout.partition()
//    .sort(null)
//    .size([2 * Math.PI, radius * radius])
//    .value(function(d) { return d.size; });
//
//  var arc = d3.svg.arc()
//    .startAngle(function(d) { return d.x; })
//    .endAngle(function(d) { return d.x + d.dx; })
//    .innerRadius(function(d) { return Math.sqrt(d.y); })
//    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
//
//  d3.json(location.href+"?usage", function(error, response) {
//    var root = rewriteUsageResponse(response[0].usage);
//    var path = svg.datum(root).selectAll("path")
//      .data(partition.nodes)
//      .enter().append("path")
//      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
//      .attr("d", arc)
//      .style("stroke", "#fff")
//      .style("fill", function(d) {return determineColor(d);})
//      .style("fill-rule", "evenodd")
//      .on("click", click) 
//      .each(stash);
//  });
//  
//
//  //Stash the old values for transition.
//  function stash(d) {
//    d.x0 = d.x;
//    d.dx0 = d.dx;
//  }
//
//  //Interpolate the arcs in data space.
//  function arcTween(a) {
//    var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
//    return function(t) {
//      var b = i(t);
//      a.x0 = b.x;
//      a.dx0 = b.dx;
//      return arc(b);
//    };
//  }
//  var tooltip;
//  var click = function(d){
//    $("#bh-profile-usage-header").html("");
//    var info = "";
//    if (d.name !== "empty"){
//      info = d.path+" ("+bytesToSize(d.size,0)+")";
//    }
//    tooltip = d3.select("#bh-profile-usage-header")
//    .append("div")
//    .style("position", "absolute")
//    .style("z-index", "10")
//    .style("visibility", "hidden")
//    .text(info);
//    return tooltip.style("visibility", "visible");
//  };
//  
//  var bytesToSize = function(bytes, precision)
//  {  
//      var kilobyte = 1024;
//      var megabyte = kilobyte * 1024;
//      var gigabyte = megabyte * 1024;
//      var terabyte = gigabyte * 1024;
//     
//      if ((bytes >= 0) && (bytes < kilobyte)) {
//          return bytes + ' B';
//   
//      } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
//          return (bytes / kilobyte).toFixed(precision) + ' KB';
//   
//      } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
//          return (bytes / megabyte).toFixed(precision) + ' MB';
//   
//      } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
//          return (bytes / gigabyte).toFixed(precision) + ' GB';
//   
//      } else if (bytes >= terabyte) {
//          return (bytes / terabyte).toFixed(precision) + ' TB';
//   
//      } else {
//          return bytes + ' B';
//      }
//  };
//  
//  var determineColor = function(d){
//   var percentage = (100 * d.value / totalSize).toPrecision(3);
//   console.log(percentage);
//   if (d.name === "empty"){
//     return "#FFFFFF";
//   } else {
//     return color((d.children ? d : d.parent).name); 
//   }
//   
////   if (percentage > 95){
////     return "red"
////   };
////   if (percentage > 90){
////     return "blue"
////   };
////   if (percentage > 80){
////     return "008741"
////   };
////   if (percentage > 70){
////     return "459c64"
////   };
////   if (percentage > 50){
////     return "9fc5a4"
////   };
////   if (percentage > 25){
////     return "b9d3ba"
////   } else {
////     return "e8f1e9";
////   };
////   else {
////     return color((d.children ? d : d.parent).name); 
////   }
//  }
//
//  d3.select(self.frameElement).style("height", height + "px");
// }
 
  var createView = function(){
    $("#bh-profile-usage-graph").html("");
    totalSize = 0;
    
    var width = 640,
    height = 420,
    radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
    
    var y = d3.scale.sqrt()
        .range([0, radius]);
    
    var color = d3.scale.category20c();
    
    var svg = d3.select("#bh-profile-usage-graph").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")")
        .text("test")
    
    var partition = d3.layout.partition()
        .value(function(d) { return d.size; });
    
    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
    
    d3.json(location.href+"?usage", function(error, response) {
      var root = rewriteUsageResponse(response[0].usage);
      $("#bh-profile-usage-header").html(root.path+"<br>"+bytesToSize(root.size)+", "+(100 * root.size / totalSize).toPrecision(3)+" % of total usage");
      
      var div = d3.select("#bh-profile-usage-graph").append("div")   
      .attr("class", "tooltip")               
      .style("opacity", 0);
      
      var path = svg.selectAll("path")
          .data(partition.nodes(root))
          .enter().append("path")
          .attr("d", arc)
          .style("stroke", "#fff")
          .style("fill", function(d) { return determineColor(d); })
          .on("click", click)
          .on("mouseover", function(d) {  
            if (d.name !== "empty") {
             div.transition()        
                 .duration(200)      
                 .style("opacity", .9);      
             div .html("<b>"+d.path+"</b><br>"+(100 * d.size / totalSize).toPrecision(3)+" % of total usage ("+bytesToSize(d.size)+")")  
                 .style("left", (d3.event.pageX+5) + "px")     
                 .style("top", (d3.event.pageY - 28) + "px");   
            };
         })   
        .on("mouseout", function(d) {  
          if (d.name !== "empty") {
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
          }
        });

      function click(d) {
        if (d.name !== "empty") {
         $("#bh-profile-usage-header").html(d.path+"<br>"+bytesToSize(d.size)+", "+(100 * d.size / totalSize).toPrecision(3)+" % of total usage");
         path.transition()
           .duration(750)
           .attrTween("d", arcTween(d));
        }
      }
    });
    
    d3.select(self.frameElement).style("height", height + "px");
    
    // Interpolate the scales!
    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d, i) {
        return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }
    
    var determineColor = function(d){
     var percentage = (100 * d.value / totalSize).toPrecision(3);
      if (d.name === "empty"){
        return "#FFFFFF";
      } else {
        return color((d.children ? d : d.parent).name); 
      }
    }
    
  }


var bytesToSize = function(bytes, precision)
{  
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;
   
    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';
 
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';
 
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';
 
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';
 
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';
 
    } else {
        return bytes + ' B';
    }
};

 var checkExist = function(children, name){
   var exist = false;
   var child = 0;
   for (var j=0 ; j < children.length; j++){
     
     // check of match dan exist = true
     if (children[j].name === name){
       exist = true;
       child = j;
     }
   };
  // bestaat hij bij de children 
  if (exist) {
    return child;
  } else {
    return null;
  }
 } 
 
 var rewriteUsageResponse = function(data){
  var returnValue = {
      "name" : "root",
      "children" : []     
  };
  
  $.each(data, function(i, value){
    if (value["_id"] === "/"){
      returnValue.size = value["value"];
      returnValue.path = "BeeHub root";
      totalSize = value["value"];
      return;
    };
   var children = returnValue.children;  
   var dirs = value["_id"].split("/");
    
   for (var i=1; i < dirs.length-1; i++) { 
     var exist = checkExist(children,dirs[i]);
     
      // last one
      if (i === (dirs.length -2)) {
        if (exist !== null) {
          // change size
          children[exist].size = value["value"]; 
        } else {
           //create object with size
           var add = {
            "name": dirs[i],
            "size": value["value"],
            "children": [],
            "path": value["_id"]
           };
           children.push(add);
        }
      // not last one
      } else {
        if (exist !== null) {
          // do nothing
          children = children[exist].children;
        } else {
          // create object without size
          var add = {
           "name": dirs[i],
           "children": [],
           "size": 0,
           // TODO hele path
           "path": value["_id"]
          };
          children.push(add);
          // pas children aan
          children = add.children;
        }
      }
    }
  });
  
  calculateSizes(returnValue);
  return returnValue;
 }
 
 var calculateSizes = function(returnValue) {
   var size = 0;
   for (var key in returnValue.children) {
     size = size + returnValue.children[key].size;
     if (returnValue.children[key].children.length > 0){
       calculateSizes(returnValue.children[key]);
     }
   }
   
   if ((returnValue.size - size) > 0) {
    var add = {
        "name": "empty",
        "children": [],
        "size": returnValue.size - size,
        // TODO hele path
        "path": "empty"
       };
    returnValue.children.push(add);
   }
//   returnValue.size = returnValue.size - size;
 };
});
