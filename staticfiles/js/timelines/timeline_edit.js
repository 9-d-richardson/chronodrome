$(function() {
	// Mostly automatically creates the variables associated with each item type
	var itemTypes = ['entry', 'divider', 'image'],
		itemsClassList = '.entry,.divider,.image',
		itemNamesUpper = {}, totalItems = {}, maxItems = {}, itemTemplates = {}
	for (itemType of itemTypes) {
		itemNamesUpper[itemType] = itemType.charAt(0).toUpperCase() + itemType.slice(1)
		totalItems[itemType] = $('#id_' + itemType + '-TOTAL_FORMS')
		maxItems[itemType] = $('#id_' + itemType + '-MAX_NUM_FORMS').val()
		itemTemplates[itemType] = $('.' + itemType + ':last').clone(true)
	}
	maxItemsMessageStart = 'Each timeline can have a maximum of ',
	maxItemsMessages = {
		'entry': maxItemsMessageStart + maxItems['entry'] + ' entries.',
		'divider': maxItemsMessageStart + maxItems['divider'] + ' dividers.',
		'image': maxItemsMessageStart + maxItems['image'] + ' images.'
	}
	fieldToGetNameFrom = {
		'entry': 'name',
		'divider': 'name',
		'image': 'caption'
	}

	// itemTemplates['importEpisodes'] = $('.import-episodes:last').clone(true)

/* If timeline_edit gets reloaded because it's invalid, this  
keeps the items marked for deletion properly hidden */
	$(document).ready(function() {
		$(itemsClassList).each(function() {
			if ($(this).find('[name$="DELETE"]').is(':checked')) {
				var button = $(this).find('[id$="delete-button"]'),
					itemType = button.attr('class').split('-')[1],
					formCount = parseInt(totalItems[itemType].val());
				deleteItem(button, itemType, formCount, 0);
			}
		});
	});

/* Gets the item number from the id of a given element such as a name field or
delete button */
	function getItemNumber(element) {
		return element.attr('id').split('-')[1];
	};

// Returns item type
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
			
/* These functions let you insert and delete timeline items as needed on
timeline-edit. Based partly on github.com/elo80ka/django-dynamic-formset */
	// Updates the attributes of each timeline item to match its new position
	updateItems = function() {
		for (itemType of itemTypes) {
			$('.' + itemType).each(function(index) {
				updateItemsRegex($(this), index, itemType)
				$(this).find('*').each(function() {                
					updateItemsRegex($(this), index, itemType)
				})
			})
			$("[class='" + itemType + "-header-text']:visible").each(function(index) {
				$(this).text(itemNamesUpper[itemType] + ' ' + (index + 1) + '/' + maxItems[itemType]);
			});
		}
	}

	// Handles the find and replace for updateItems
	updateItemsRegex = function(item, index, itemType) {
		var idRegex = new RegExp(itemType + '-(\\d+|__prefix__)-'),
			replacement = itemType + '-' + index + '-';
		if (item.attr("for")) {
			item.attr("for", item.attr("for").replace(idRegex, replacement));
		}
		if (item.attr('id')) {
			item.attr('id', item.attr('id').replace(idRegex, replacement));
		}
		if (item.attr('name')) {
			item.attr('name', item.attr('name').replace(idRegex, replacement));
		}
	}

	/* updatePositions has to be kept separate from updateItems because when
	the form is submitted the new forms get moved to the end of the formset but
	their position has to NOT be updated. */
	updatePositions = function() {
		$(itemsClassList).each(function(index) {
			$(this).find('[name$="position"]').val(index)
		});
	}

/* Gets the required paramaters when delete/undelete/insert is clicked, then
sends those parameters to the appropriate function. Also flags that button as
temporarily disabled, to prevent glitches from accidental double clicks. */
	$(document).on('click', 'a[class^="delete"],a[class^="undelete"],a[class^="insert"]', function() {
		var button = $(this)
		if (!button.hasClass('temp-disabled')) {
			var	action = button.attr('class').split('-')[0],
				itemType = button.attr('class').split('-')[1],
				formCount = parseInt(totalItems[itemType].val());
			button.addClass('temp-disabled');
			if (action === 'delete') {
				deleteItem(button, itemType, formCount)
			} else if (action === 'undelete') {
				undeleteItem(button, itemType, formCount)
			} else if (action === 'insert') {
				insertItem(button, itemType, formCount)
			}
		}
	})

	/* fadeOutTime is a parameter because this is also called when the page is 
	loaded, and in that case it has to be 0 */
	function deleteItem(button, itemType, formCount, fadeOutTime=500) {
		var itemNumber = getItemNumber(button)
		deletedName = $('#id_' + itemType + '-' + itemNumber + '-' + 
			fieldToGetNameFrom[itemType]).val();
		if (deletedName.length > 30) {
			deletedName = deletedVal.slice(0,25) + '...'
		}
		undoDeleteText = '<p><a class="undelete-' + itemType + '" id="id_' + 
			itemType + '-' + itemNumber + '-undelete" ' +
			'href="javascript:void(0)"> Undo Delete ' + itemNamesUpper[itemType] + 
			'</a> - "' + deletedName + '"</p>'

		$('#id_' + itemType + '-' + itemNumber + '-DELETE').val(true)
		$('.user-form').addClass('changed-input');
		
		var parentForm = button.parent()
		parentForm.fadeOut(fadeOutTime, function() { 
			parentForm.after(undoDeleteText);
			updateItems();
			updatePositions();
			button.removeClass('temp-disabled');
		});
	}
	
	function undeleteItem(button, itemType, formCount) {
		var itemNumber = getItemNumber(button)
		if (maxItems[itemType] <= formCount) {
			alert(maxItemsMessages[itemType]);
		} else {
			$('#id_' + itemType + '-' + itemNumber + '-DELETE').val('')
			button.parent().prev().fadeIn(1000);
			button.parent().remove();
			updateItems();
			updatePositions();
			button.removeClass('temp-disabled');
		}
	};

	function insertItem(button, itemType, formCount) {
		templateCopy = itemTemplates[itemType].clone(true);
		if (maxItems[itemType] <= formCount) {
			alert(maxItemsMessages[itemType]);
		} else {
			/*Note that it has to be the contains selector (*) not the ends with
			selector ($) because after adding the temp-disabled class, the button's
			class no longer ends with "at-start", since the classes are all treated
			as a single string. */
			if (button.is('[class*="at-start"]')) {
				$('.formset').prepend(templateCopy);
			} else {
				button.parent().after(templateCopy);
			}
			templateCopy.hide().fadeIn(1000);
			totalItems[itemType].val(formCount + 1);
			updateItems();
			updatePositions();
			button.removeClass('temp-disabled');
		};
	}

	// This is for episode lists
	// $(document).on('click', 'a[class^="show"]', function() {
	// 	var button = $(this),
	// 		parentForm = button.parent().parent();
	// 		lastField = parentForm.find('input,textarea').last();
	// 	  templateCopy = itemTemplates['importEpisodes'].clone(true);
	//   templateCopy.insertAfter(lastField);
	//   templateCopy.hide().fadeIn(1000);
	//   button.parent().fadeOut(500);
	// })

/* Calls on jquery.swap.js to swap non-hidden items in the TL if the item isn't 
flagged as temporarily disabled */
	$(document).on('click', 'a[id$="down"],a[id$="up"]', function() {
		var button = $(this);
		if (!button.hasClass('temp-disabled')) {
			button.addClass('temp-disabled')
			var itemNumber = getItemNumber(button),
				itemType = getItemType(button),
				parentForm = $('#id_' + itemType + '-' + itemNumber + '-div');
			if (button.is('[id$="down"]')) {
				var swapPartners = parentForm.nextAll().filter("div:visible");
			} else {
				var swapPartners = parentForm.prevAll().filter("div:visible");
			}
			itemToSwapWith = swapPartners.first();
			if (itemToSwapWith.length) {
				parentForm.swap(itemToSwapWith, button)
			}
		}
	})

/* Moves the newly inserted items to the end of the formset upon submission, 
since Django wants formsets to have the old ones with IDs first and the new 
ones without IDs at the end or it will cause an error. Bit of a hack to do it 
in JS, but probably the least bad solution. */
	$('form.timeline-edit-form').submit(function(e) {
		/* To keep the order right, you have to call updatePositions, then reorder 
		the items, then call updateItems */
		updatePositions();
		$(itemsClassList).each(function() {
			if ($(this).find('[name$="id"]').val() == '') {
				$(this).appendTo($('.formset'));
			}
		})
		updateItems();
	});
});