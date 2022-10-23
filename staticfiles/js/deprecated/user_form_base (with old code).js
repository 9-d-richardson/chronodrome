/* Helper functions used by templates which have the user-form class to
check for errors in user input */

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

/* Gets the item number from the id of a given element such as a name field or
delete button */
function getItemNumber(element) {
	return element.attr('id').split('-')[1];
};

function getItemType(element) {
	if (element.is('[id^="id_entry"]')) {
		return 'entry';
	} else if (element.is('[id^="id_divider"]')) {
		return 'divider';
	} else if (element.is('[id^="id_image"]')) {
		return 'image';
	}
	return null;
}

// Checks if an entry doesn't have a name but does have other fields filled in
function isNameMissing(itemNumber, itemType) {
	if ($('#id_' + itemType + '-' + itemNumber + '-name').val() != '') {
		return false;
	}
	var otherFieldsFilled = false;
	$('[id^="id_' + itemType + '-' + itemNumber + 
		'"]:not([id$="name"]):not([id$="id"])').each(function() {
		if ($(this).val() != '') {
			otherFieldsFilled = true;
			return false;
		}
	});
	return otherFieldsFilled;
};

// From freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	'(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	'(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
function isValidUrl(urlString) {
	if (urlString.startsWith('//') && !!urlPattern.test(urlString.slice(2))) {
		return true
	}
	return !!urlPattern.test(urlString);
}

const emailPattern = new RegExp("([!#-'*+/-9=?A-Z^-~-]+"+
	"(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@"+
	"([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
function isValidEmail(emailString) {
	return !!emailPattern.test(emailString);
}

/* Checks whether a given username or email is already in use by calling  
isFieldTaken in accounts/views.py. Setting async to false is a 
deprecated feature but useful when the user is submitting a form (as opposed
to just entering data where it could hurt the responsiveness) */
function isFieldTaken(string, field, callback, async=true) {
	$.ajax({
		type: 'GET',
		url: '/accounts/ajax/is_field_taken',
		async: async,
		data: {'string': string, 'field': field},
		success: function(response) {
			callback(response['taken']);
		},
		error: function(response) {
			console.log(response);
		}
	});
}

// Checks if the import form has more non-blank lines than allowed entries
function tooManyLines(textField) {
	var importText = textField.val().split('\n'),
		totalLines = 0;
	for (line of importText) {
		if (line.trim() !== '') {
			totalLines += 1;
		}
		if (totalLines > 1000) {
			return true;
		}
	}
	return false;
}

/* Checks if a textfield is longer than TextFieldMaxLength (in 
shared_constants.py). The JSON.stringify part is necessary to avoid a weird 
error where the length of newlines is counted improperly by Django. */
function isTextFieldTooLong(textField) {
	return JSON.stringify(textField.val()).length >= 10000
};

/* These functions hide or display error messages for a given field. */
function showError(field, errorType, itemNumber=null, itemType=null) {
	if (itemType === null) {
		$('#id_' + field).addClass('form-error-field');
		$('#id_' + field + '-error-' + errorType).show()
	} else {
		$('#id_' + itemType + '-' + itemNumber + '-' + field).addClass('form-error-field');
		$('#id_' + itemType + '-' + itemNumber + '-' + field + '-error-' + errorType).show();
	}
}

function hideError(field, errorType, itemNumber=null, itemType=null) {
	if (itemType === null) {
		var element = $('#id_' + field),
			messagesClass = 'id_' + field + '-error-';
	} else {
		var element = $('#id_' + itemType + '-' + itemNumber + '-' + field),
			messagesClass = 'id_' + itemType + '-' + itemNumber + '-' + field + '-error-';
	}
	$('#' + messagesClass + errorType).hide();
	errorCount = $('[id^="' + messagesClass + '"]:visible').length;
	if (errorCount === 0) {
		element.removeClass('form-error-field');
	}
}

