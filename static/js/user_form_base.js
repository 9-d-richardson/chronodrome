/* Helper functions used by templates which have the user-form class. Each
function has to be called by the page itself, it's not automatic here. */

/* Prevents forms from being submitted when user hits enter, but doesn't
stop the search bar from working or from entering extra lines in textareas */
function stopEnterFromSubmitting() {
	$(document).on("keypress", 'form', function (e) {
		var code = e.keyCode || e.which,
			target = e.target.name,
			tagName = e.target.tagName;
		if (code == 13 && target != 'query' && tagName != 'TEXTAREA') {
			e.preventDefault();
			return false;
		}
	});
};

/* Check for unsaved changes and warns if you navigate away without saving. It
doesn't warn about any blank entries the user has added but that's fine. */
function warnOfUnsavedChanges() {
	$('.user-form').on('input', 'input:not([type="password"]), textarea, select', function (e) {
		$('.user-form').addClass('changed-input');
	});

	$(window).on('beforeunload', function () {
		if ($('.changed-input').length) {
			return "You have unsaved changes. Do you wish to leave this page?";
		}
	});

	// Turns off the unsaved changes warning when you hit submit
	$('form:not([action="/search/"])').submit(function() {
		$(window).off('beforeunload');
	});
};

/* Shows the red borders for fields with errors upon page loading (is 
customized a bit for image fields, where it's the surrounding div that needs to
be highlighted, not the field itself). Note that for fields being rendered
manually, you have to wrap both the field and its errors within a 
<span class="field"> element. */
function markFieldErrors() {
	$('.field').each(function() {
		if ($(this).find('.form-error-text').length > 0) {
			$(this).find('textarea,input:not([type="file"]),.image-field').addClass('form-error-field');
		}
	}) 
}
