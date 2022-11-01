/* JS for the various search pages. Handles the behavior of the dropdown
sort menus */

$(function() {
	// From https://learningjquery.com/2012/06/get-url-parameters-using-jquery
	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = window.location.search.substring(1),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
			}
		}
		return false;
	};
	var sort = getUrlParameter('sort');

	/* Changes the default dropdown choice to what's in the paramaters iff
	what's in the parameters is a valid choice */
	var sortOptions = $("select").first().children().map(function() {
		return this.value;
	}).get();
	if (sortOptions.includes(sort)) {
		$("select.sort").val(sort)
	}

	/* Redirects to a new search page sorted by whichever option the user chooses
	in the dropdown menu. */
	$('select').change(function() {
		var $option = $(this).val();
		var url = new URL(window.location.href);
		url.searchParams.set('page', '1');
		url.searchParams.set('sort', $option);
		window.location.href = url.href;
	});
});