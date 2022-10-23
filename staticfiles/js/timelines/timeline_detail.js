/* Marks entries as read/unread and makes the appropriate changes to the HTML
and to the model in Django. The HTML changes are in a separate function that's 
only called after a successful post to keep the page in line with the SQL. */
$(function() {
	$(".user-has-read-change button").click(function(e) {
		e.preventDefault();
		var button = $(this),
			entryID = button.val();
		$.ajax({
			type: 'POST',
			url: '/timelines/ajax/user_has_read_change',
			data: {
				'action': button.attr('class'), 
				'entryID': entryID, 
				'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
			},
			success: function(response) {
				changeHTMLAfterUserHasReadChange(button, entryID)
			},
			error: function(response) {
				console.log(response);
			}
		});
	});

	function changeHTMLAfterUserHasReadChange(button, entryID) {
		$("#user-has-read").load(location.href + " #user-has-read>*","");
		if (button.is('.mark-all-above-as-read')) {
			changedEntries = $('div#entry-' + entryID).prevAll().addBack().filter('.entry');
			changedEntries.addClass('has-finished');
			changedEntries.find('[id^="is-read"]').show();
			changedEntries.find('[id^="is-unread"]').hide();
		} else {
			$('div#entry-' + entryID).toggleClass('has-finished');
			$('div#is-read-' + entryID).toggle();
			$('div#is-unread-' + entryID).toggle();
		}
	}

});