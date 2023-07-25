/* Focuses on the search bar when the page is first loaded without jumping 
to it. This slightly roundabout way of doing it is in order to get the cursor 
to appear at the end of the search bar when there's already text in it. 
Apparently there's a bug in Chrome that requires this "setTimeout" function */
function focus_on_search(e) {
	setTimeout(function(){
		const search = document.getElementById('query');
		search.selectionStart = search.selectionEnd = search.value.length;
		search.focus({preventScroll: true});
	}, 0)
}
window.addEventListener('DOMContentLoaded', focus_on_search, false);

//Handles adding/removing bookmarks for search_base and timeline_detail
$(function() {
	$(".bookmark-change button").click(function(e) {
		e.preventDefault();
		var timelineURL = $(this).val();
		$.ajax({
			type: 'POST',
			url: '/timelines/ajax/bookmark_change',
			data: {
				'action': $(this).attr('class'), 
				'timelineURL': timelineURL, 
				'csrfmiddlewaretoken': $("input[name=csrfmiddlewaretoken]").val()
			},
			success: function(response) {
				changeHTMLAfterBookmarkChange(timelineURL);
			},
			error: function(response) {
				console.log(response);
			}
		});
	});

	function changeHTMLAfterBookmarkChange(timelineURL){
		$('div#' + timelineURL + '-add-bookmark').toggle();
		$('div#' + timelineURL + '-remove-bookmark').toggle();
	}
})