$(function() {
	// prevent hide previous collaped item
	$('.accordion-heading').click(function (e) {
	  $(this).next().collapse("toggle");
	});
	
	// Kleur bij openklappen aanpassen
	$('.accordion-group').on('show', function (e) {
	   $(e.target).parent().addClass('accordion-group-active');
	});
	
	// Kleur bij inklappen weer verwijderen
	$('.accordion-group').on('hide', function (e) {
	  $(e.target).parent().removeClass('accordion-group-active');
	});
	
	/*
	 * Action when the join button at a group is clicked
	 */
	var joinListener = function(button){
		// Send leave request to server
		var client = new nl.sara.webdav.Client();
		client.post(button.val(), function(status){
		  if (status != 200) {
				alert('Something went wrong on the server. No changes were made.');
				return;
		  };
		  // Change button to join button
		  var cancelrequestbutton = $('<button type="button" value="'+button.val()+'" class="btn btn-danger joinleavebutton">Cancel request</button>');
		  cancelrequestbutton.click(function () {
	            joinLeaveListener($(this));
	        });
	      button.closest('a').append(cancelrequestbutton);
	      button.remove();
		}, 'join=1');
	}
	
	$('.joinbutton').on('click', function (e) {
		joinListener($(this));
	});
	
	var joinLeaveListener = function(button){
	   // Are you sure?
		if (confirm('Are you sure you want to cancel membership of the group '+button.closest('td').prev().html()+' ?')) {
			// Send leave request to server
			var client = new nl.sara.webdav.Client();
			client.post(button.val(), function(status){
				if (status != 200) {
					alert('Something went wrong on the server. No changes were made.');
					return;
				};
				// Change button to join button
				var joinbutton = $('<button type="button" value="'+button.val()+'" class="btn btn-success joinbutton">Join</button>');
				joinbutton.click(function () {
		            joinListener($(this));
		        });
		        button.closest('a').append(joinbutton);
		        button.remove();
		        // Remove group from mygroups
		        var leavebutton = $('[id="panel-mygroups"]').find('[value="'+button.val()+'"]');
		        if (leavebutton.length !=0) {
		        	leavebutton.closest('.accordion-group').remove(); 
		        }
			}, 'leave=1');
	    }
	}
		
	/*
	 * Action when the leave button in a group is clicked
	 */
	$('.joinleavebutton').on('click', function (e) {
		joinLeaveListener($(this));
	});
	
	/*
	 * Action when the leave button in a group is clicked
	 */
	$('.mygroupsleavebutton').on('click', function (e) {
		var button = $(this);
	   // Are you sure?
		if (confirm('Are you sure you want to leave the group '+button.parent().prev().html()+' ?')) {
			// Send leave request to server
			var client = new nl.sara.webdav.Client();
			client.post(button.val(), function(status){
			  if (status != 200) {
					alert('Something went wrong on the server. No changes were made.');
					return;
			  };
			  button.closest('.accordion-group').remove(); 
			  var leavebutton = $('[id="panel-join"]').find('[value="'+button.val()+'"]');
			  var joinbutton = $('<button type="button" value="'+button.val()+'" class="btn btn-success joinbutton">Join</button>');
			  joinbutton.click(function () {
				joinListener($(this));
			  });
			  leavebutton.closest('a').append(joinbutton);
		      leavebutton.remove();
			}, 'leave=1');
	    }
	});
	
	 $('#filterbyname').keyup(function () {
		var filterfield = $(this);
		// when field is empty, filter icon
		$(this).parent().find('[id="iconerase"]').remove();
		$(this).parent().find('[id="iconfilter"]').remove();
		if (filterfield.val().length == 0){
			var iconfilter = $('<span class="add-on" id="iconfilter"><i class="icon-filter" ></i></span>');
			$(this).parent().prepend(iconfilter);
		// when field is not empty, erase icon with listener
		} else {
			var iconerase = $('<span class="add-on" id="iconerase"><i class="icon-remove-circle" ></i></span>');
			$(this).parent().prepend(iconerase);
			$('#iconerase').on('click', function (e) {
				filterfield.val("");
				filterfield.trigger('keyup');
			});
		}
		var regex = new RegExp(filterfield.val(), 'gi' );
		$('div#joingroups.accordion').find('.accordion-group').filter(function(index) {
			$(this).hide();
			return $(this).find('th').html().match(regex) != null;
		}).show(); 
	 });
	
	 $('#groupName').change(function () {
		 var groupNameField = $(this);
		 
		 var showError = function(error){
			 groupNameField.parent().parent().addClass('error');
			 var error = $('<span class="help-inline">'+error+'</span>');
			 groupNameField.parent().append(error);
		 }
		 
		 // TODO make tooltip with field specifications
		 // clear error
		 groupNameField.next().remove();
		 groupNameField.parent().parent().removeClass('error');
		 
		 // value not system
		 if (RegExp('^system$|^home$','i').test(groupNameField.val())) {
			showError(groupNameField.val()+' is not a valid groupname.');
			return;
		 }

		// Seperate regular expressions to make the errors more specific.
		// value starts with a-zA-Z0-9, else return
		 if (!RegExp('^[a-zA-Z0-9]{1}.*$').test(groupNameField.val())) {
			 showError('First character must be a aphanumeric character or number.');
			 return;
		 }
		// value only contain a-zA-Z0-9_-., else return
		 if (!RegExp('^[a-zA-Z0-9]{1}[a-zA-Z0-9_\\-\\.]*$').test(groupNameField.val())) {
			 showError('This field can contain aphanumeric characters, numbers, "-", "_" and ".".');
			 return;
		 }
		// value contain 1-255 characters, else return
		 if (!RegExp('^[a-zA-Z0-9]{1}[a-zA-Z0-9_\\-\\.]{0,255}$').test(groupNameField.val())) {
			showError('This field can contain maximal 255 characters.');
			return;
		 }
		 // ajax request, is groupname already in use
		var client = new nl.sara.webdav.Client();
		client.post('system/groups/'+groupNameField.val(), function(status){
			if (status == 404 || status >= 500 ) {
				return
			}
			showError('This groupname is already in use.');
			return;
		}, '');
	 })
	 
	// TODO request action uitvoeren
	$('#requestmembershipbutton').on('click', function (e) {
	  alert("button request membership clicked")
	});
	
	//TODO request action uitvoeren
	$('#cancelrequestinvitationbutton').on('click', function (e) {
	  alert("button cancel request invitation clicked")
	});
	
	// Pieterb:
	$('ul#beehub-top-tabs a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	});
	
	$('.accordion-heading a').click(function (e) { 
	  e.stopPropagation(); 
	});
	
	$('.btn-danger').click(function (e) {
	  e.stopPropagation();
	});
});