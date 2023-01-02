$(function() {
	/* Marks entries and their episodes as finished/unfinished and makes the 
	appropriate changes to the Django model via Ajax and then, assuming success, 
	to the HTML (in a separate function). */
	$(".user-has-finished-change button").click(function(e) {
		e.preventDefault();
		var button = $(this),
			entryID = button.val(),
			action = button.attr('class');
		$.ajax({
			type: 'POST',
			url: '/timelines/ajax/user_has_finished_change',
			data: {
				'action': action, 
				'entryID': entryID, 
				'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
			},
			success: function(response) {
				changeEntryHTMLAfterAjaxFinishes(action, entryID)
			},
			error: function(response) {
				console.log(response);
			}
		});
	});

	function changeEntryHTMLAfterAjaxFinishes(action, entryID) {
		entry = $('#entry-' + entryID)
		if (action === 'mark-as-finished') {
			entry.addClass('has-finished');
			$('#is-finished-' + entryID).show();
			$('#is-unfinished-' + entryID).hide();
			entry.find('.mark-ep-as-finished-div').hide();
			entry.find('.mark-ep-as-unfinished-div').show();
			entry.find('.episode-text').addClass('has-finished');
		} else if (action === 'mark-as-unfinished') {
			entry.removeClass('has-finished');
			$('#is-finished-' + entryID).hide();
			$('#is-unfinished-' + entryID).show();
			entry.find('.mark-ep-as-finished-div').show();
			entry.find('.mark-ep-as-unfinished-div').hide();
			entry.find('.episode-text').removeClass('has-finished');
		}
		reloadFinishedCounters();
	}

	/* Marks episodes as finished/unfinished and makes changes to the parent
	entry as well if required. */
	$(".user-has-finished-ep-change button").click(function(e) {
		e.preventDefault();
		var button = $(this),
			entryID = button.val().split('-')[0]
			episodeID = button.val().split('-')[1],
			action = button.attr('class');
		$.ajax({
			type: 'POST',
			url: '/timelines/ajax/user_has_finished_ep_change',
			data: {
				'action': action, 
				'episodeID': episodeID, 
				'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
			},
			success: function(response) {
				needToMarkEntryFinished = response['need_to_mark_entry_finished']
				changeItemHTMLAfterAjaxFinishes(action, entryID, episodeID, 
					needToMarkEntryFinished)
			},
			error: function(response) {
				console.log(response);
			}
		});
	});

	function changeItemHTMLAfterAjaxFinishes(action, entryID, episodeID, 
		needToMarkEntryFinished) {
		if (action === 'mark-ep-as-unfinished') {
			$('#episode-' + episodeID).removeClass('has-finished');
			$('#ep-is-finished-' + episodeID).hide();
			$('#ep-is-unfinished-' + episodeID).show();
			$('#entry-' + entryID).removeClass('has-finished');
			$('#is-finished-' + entryID).hide();
			$('#is-unfinished-' + entryID).show();
		} else if (action === 'mark-ep-as-finished') {
			$('#episode-' + episodeID).addClass('has-finished');
			$('#ep-is-finished-' + episodeID).show();
			$('#ep-is-unfinished-' + episodeID).hide();
			if (needToMarkEntryFinished === true) {
				$('#entry-' + entryID).addClass('has-finished')
				$('#is-finished-' + entryID).show();
				$('#is-unfinished-' + entryID).hide();
			}
		}
		reloadFinishedCounters();
	}

	/* Reloads the parts of the pages which count how many items the user has
	finished. Might need to rewrite at some point if this turns out to be too 
	resource intensive */
	function reloadFinishedCounters() {
		$("#user-has-finished").load(location.href + " #user-has-finished>*","");
		$(".finished-episodes-count").each(function() {
			countID = $(this).attr('id');
			$('#' + countID).load(location.href + " #" + countID,"");
		})
	}

	// Shows or hides the episode list for a given entry
	$(document).on('click', 'a[class^="show-eps"],a[class^="hide-eps"]', function() {
		var itemNumber = $(this).attr('id').split('-')[2];
		$('#hide-eps-' + itemNumber).toggle();
		$('#show-eps-' + itemNumber).toggle();
		$('#episode-list-' + itemNumber).toggle();
	})

});