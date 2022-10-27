/* Marks entries as finished/unfinished and makes the appropriate changes to the HTML
and to the model in Django. The HTML changes are in a separate function that's 
only called after a successful post to keep the page in line with the SQL. */
$(function() {
	$(".user-has-finished-change button").click(function(e) {
		e.preventDefault();
		var button = $(this),
			entryID = button.val();
		$.ajax({
			type: 'POST',
			url: '/timelines/ajax/user_has_finished_change',
			data: {
				'action': button.attr('class'), 
				'entryID': entryID, 
				'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
			},
			success: function(response) {
				changeHTMLAfterUserHasFinishedChange(button, entryID)
			},
			error: function(response) {
				console.log(response);
			}
		});
	});

	function changeHTMLAfterUserHasFinishedChange(button, entryID) {
		$("#user-has-finished").load(location.href + " #user-has-finished>*","");
		if (button.is('.mark-all-above-as-finished')) {
			changedEntries = $('div#entry-' + entryID).prevAll().addBack().filter('.entry');
			changedEntries.addClass('has-finished');
			changedEntries.find('[id^="is-finished"]').show();
			changedEntries.find('[id^="is-unfinished"]').hide();
		} else {
			$('div#entry-' + entryID).toggleClass('has-finished');
			$('div#is-finished-' + entryID).toggle();
			$('div#is-unfinished-' + entryID).toggle();
		}
	}

});