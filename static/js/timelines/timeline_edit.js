$(function() {
	/* Mostly automatically creates the variables associated with each item type
	for all the other functions to work with */
	var itemTypes = ['entry', 'divider', 'image'],
		itemsClassList = '.entry,.divider,.image',
		itemNamesUpper = {}, totalItems = {}, maxItems = {}, itemTemplates = {}
	for (itemType of itemTypes) {
		itemNamesUpper[itemType] = itemType.charAt(0).toUpperCase() + itemType.slice(1)
		totalItems[itemType] = $('#id_' + itemType + '-TOTAL_FORMS')
		maxItems[itemType] = $('#id_' + itemType + '-MAX_NUM_FORMS').val()
		itemTemplates[itemType] = $('.' + itemType + ':last').clone(true)
	}
	maxItemsMessageStart = 'Each timeline can have a maximum of ';
	maxItemsMessageEnd = 'Deleted items count towards this total. ' + 
		'If you have too many deleted items, just save your timeline and then ' +
		'go back to editing it.'
	maxItemsMessages = {
		'entry': maxItemsMessageStart + maxItems['entry'] + ' entries. ' + 
			maxItemsMessageEnd,
		'divider': maxItemsMessageStart + maxItems['divider'] + ' dividers. ' + 
			maxItemsMessageEnd,
		'image': maxItemsMessageStart + maxItems['image'] + ' images. ' + 
			maxItemsMessageEnd
	}
	fieldToGetNameFrom = {
		'entry': 'name',
		'divider': 'name',
		'image': 'caption'
	}

	itemNamesUpper['episode'] = "Episode"
	totalItems['episode'] = $('#id_episode-TOTAL_FORMS')
	maxItems['episode'] = $('#id_episode-MAX_NUM_FORMS').val()
	itemTemplates['episode'] = $('.episode:last').clone(true)
	maxItemsMessages['episode'] = 'Each timeline can have a maximum of ' + 
		maxItems['episode'] + ' episodes. ' + maxItemsMessageEnd
	fieldToGetNameFrom['episode'] = 'name'
	maxEpsPerEntry = $('[name="max-eps-per-entry"]').val()
	maxEpsPerEntryMessage = 'Each entry can have a maximum of ' + maxEpsPerEntry +
	 ' episodes. ' + maxItemsMessageEnd

	itemTemplates['importepisodes'] = $('.importepisodes-inner-div:last').clone(true)
	totalItems['importepisodes'] = $('#id_importepisodes-TOTAL_FORMS')

/*Removes images that have been prepared for upload. Will have to rewrite this
a bit if we make the form more complicated with extra divs. */
	$(document).on('click', 'button.remove-image', function(e) {
		e.preventDefault();
		$(this).siblings('input[type="file"]').val(null);
	});
			
	/* Updates the attributes and header of each timeline item to match its new 
	position */
	updateItems = function() {
		/* Updates the indexing for each type of items, then changes the header 
		numbering but only for the visible items */
		for (itemType of itemTypes) {
			$('.' + itemType).each(function(index) {
				updateAttributes($(this), index, itemType)
			})
			$('.' + itemType + '-header:visible').each(function(index) {
				updateHeader($(this), index, itemType, maxItems[itemType])
			});
		}

		/* Does the same thing as above but for each entry's episodes. The header
		numbering is by entry, but the numbering for the HTML attributes numbers
		eps like they were any other TL item, because there would be naming 
		conflicts if each entry's eps started being numbered at 0. */
		$('.episode').each(function(index) {
			updateAttributes($(this), index, 'episode')
		})
		$('.entry').each(function() {
			$(this).find('.episode-header:visible').each(function(index) {
				updateHeader($(this), index, 'episode', maxEpsPerEntry)
			})
			numOfEpisodes = $(this).find('[id^="id_episode"][id$="DELETE"]').not('.marked-for-deletion').length
			$(this).find('.number-of-episodes').text('(' + numOfEpisodes + ' total)')
		})

		/* Does the same thing but for the importepisodes feature. Note that the
		position value doesn't need to be handled specially. */
		$('.importepisodes-inner-div').each(function(index) {
			updateAttributes($(this), index, 'importepisodes')
		})

		// Handles the Regex for updating each item's attributes
		function updateAttributes(item, index, itemType) {
			var idRegex = new RegExp(itemType + '-(\\d+|__prefix__)'),
				replacement = itemType + '-' + index;
			const attributes = ['for', 'id', 'name']
			item.find('*').addBack().each(function() {
				for (attribute of attributes) {
					if ($(this).attr(attribute)) {
						$(this).attr(attribute, $(this).attr(attribute).replace(idRegex, replacement));
					}
				}
			})
		}

		/*Changes the numbering for only the visible headers. itemLimit is different
		for episodes and other items, because for episodes the relevant number is
		episodes allowed per entry, not episodes per timeline. */
		function updateHeader(header, index, itemType, itemLimit) {
			header.text(itemNamesUpper[itemType] + ' ' + (index + 1) + '/' + itemLimit);
		}
	}	

	/* updatePositions has to be kept separate from updateItems because when
	the form is submitted the new forms get moved to the end of the formset but
	their position has to NOT be updated. */
	updatePositions = function() {
		$(itemsClassList).each(function(index) {
			$(this).find('[name$="position"]').val(index);
		});
		$('.entry').each(function() {
			$(this).find('.episode').each(function(index) {
				$(this).find('[name$="position_episode"]').val(index);
			})
		})
	}

	/*A helper function for when TL buttons are clicked. Gathers all the 
	relevant data from the button as well as any other info the functions need*/
	function getButtonData(button) {
		buttonData = {parentForm: button.closest('[id^="id_"]')}
		buttonData.itemType = buttonData.parentForm.attr('class')
		buttonData.idBase = "id_" + buttonData.itemType + '-' + 
			buttonData.parentForm.attr('id').split('-')[1] + '-';
		return buttonData
	}

	// Adds items to the TL only if the max number of items hasn't been reached.
	$(document).on('click', 'a[class$="add"]', function() {
		button = $(this)
		itemType = button.attr('class').split('-')[0]
		formCount = parseInt(totalItems[itemType].val());
		if (!checkIfMaxNumberItemsReached(button, itemType, formCount)) {
			isAtStart = button.attr('class').split('-')[1] === 'start';
			parentForm = button.closest('[id^="id_"]');
			templateCopy = itemTemplates[itemType].clone(true);
			if (isAtStart === true && itemType === 'episode') {
				button.parent().after(templateCopy)
			} else if (isAtStart === true) {
				$(itemsClassList).first().before(templateCopy)
			} else {
				parentForm.after(templateCopy);
			}
			templateCopy.hide().fadeIn(1000);
			totalItems[itemType].val(formCount + 1);
			finishItemChanges(button);
		};

		/* Checks if there are too many items to add any more. Items marked for
		deletion count towards the total */
		function checkIfMaxNumberItemsReached(button, itemType, formCount) {
			if (maxItems[itemType] <= formCount) {
				alert(maxItemsMessages[itemType]);
				return true;
			}
			if (itemType === 'episode') {
				parentEntry = button.closest('.entry');
				episodesPerThisEntry = parentEntry.find('.episode').length;
				if (maxEpsPerEntry <= episodesPerThisEntry) {
					alert(maxEpsPerEntryMessage);
					return true;
				}
			}
			return false;
		}
	})

/*For when the user deletes a TL item. Just calls the deleteItem function*/
	$(document).on('click', 'a[class^="delete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			deleteItem($(this), 500)
		}
	})

/* 
- If timeline_edit gets reloaded because it's invalid, this keeps the items 
marked for deletion properly hidden, both episodes and regular TL items. 
Ideally, the page will look the same as before, just with the errors marked and
with the episode lists that have no errors hidden. 
- The second parameter in the deleteItem() call is to set fadeoutTime to 0 so 
that the deleted items disappear immediately. 
- It's necessary to call updateItems() because otherwise items can start out 
with the wrong ID number, which can mess up the undelete button for items 
marked for deletion when the page reloads. 
*/
	$(document).ready(function() {
		updateItems();
		$('[name$="DELETE"]:not([name^="importepisodes"])').each(function() {
			if ($(this).val() === 'true') {
				parentForm = $(this).parent().closest('[id^="id_"]');
				if ($(this))
				if (parentForm.hasClass('episode')) {
					var button = parentForm.find('.delete');
					deleteItem(button, 0);
				} else {
					var button = parentForm.find('.delete:not([id^="id_episode"])');
					deleteItem(button, 0);
				}
			}
		})
	});

/*Hides items marked for deletion. Has to be a separate, named function
because it also gets called when the page first loads*/
	function deleteItem(button, fadeOutTime) {
		const {itemType, idBase, parentForm} = getButtonData(button)
		button.addClass('temp-disabled')
		deletedName = $('#' + idBase + fieldToGetNameFrom[itemType]).val();
		if (deletedName.length > 30) {
			deletedName = deletedVal.slice(0,25) + '...'
		}
		undeleteText = '<p><a class="' + itemType + '-undelete" id="' + idBase + 
			'undelete" href="javascript:void(0)"> Undo Delete ' + 
			itemNamesUpper[itemType] + '</a> - "' + deletedName + '"</p>'

		parentForm.find('[id$="DELETE"]').val(true)
		if (itemType === 'episode') {
			parentForm.find('[id$="DELETE"]').addClass('marked-for-deletion')
		}
		$('.user-form').addClass('changed-input');
		parentForm.fadeOut(fadeOutTime, function() { 
			parentForm.after(undeleteText);
			finishItemChanges(button);
		});
	}

	/* Unhides the item which had been marked for deletion and removes the
	undelete text */
	$(document).on('click', '[id$="undelete"]', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			itemType = button.attr('class').split('-')[0]
			itemToUndelete = $('#id_' + itemType + '-' + 
				button.attr('id').split('-')[1] + '-id-div')
			button.addClass('temp-disabled')
			/* This bit of logic ensures that episodes which have been separately
			marked for deletion stay that way even when the parent entry is
			undeleted. */
			if (itemType === 'episode') {
				itemToUndelete.find('[id$="DELETE"]').removeClass('marked-for-deletion');
				itemToUndelete.find('[id$="DELETE"]').val('')
			} else {
				itemToUndelete.find('[id$="DELETE"]:not([id^="id_episode"])').val('')
				if (!itemToUndelete.find('.episode-list').hasClass('list-marked-for-deletion')) {
					itemToUndelete.find('[id^="id_episode"][id$="DELETE"][class!="marked-for-deletion"]').val('')
				}
			}
			itemToUndelete.fadeIn(500);
			button.parent().remove();
			finishItemChanges(button);
		}
	})

	// Shows or hides the episode list for a given entry
	$(document).on('click', '.show-episode-list,.hide-episode-list', function() {
		button = $(this);
		const {parentForm} = getButtonData(button);
		parentForm.find('.show-episode-list').toggle();
		parentForm.find('.hide-episode-list').toggle();
		parentForm.find('.episode-list').toggle();
	})

	/* Adds an episode list to a given entry, and adds an episode automatically */
	$(document).on('click', 'a[class^="add-episode-list"]', function() {
		button = $(this);
		const {parentForm} = getButtonData(button);
		parentForm.find('.episode-start-add').click();
		parentForm.find('.episode-list').show();
		parentForm.find('.show-episode-list').hide();
		parentForm.find('.hide-episode-list').show();
		parentForm.find('.has-episodes-buttons').show();
		parentForm.find('.no-episodes-buttons').hide();
	})

	/* Adds an import form to the entry, or if there is already an import form,
	shows the form and removes the deletion indicators */
	$(document).on('click', '.add-import', function() {
		button = $(this);
		const {parentForm} = getButtonData(button);
		if (parentForm.find('.importepisodes-inner-div').length === 0) {
			templateCopy = itemTemplates['importepisodes'].clone(true);
			parentForm.find('.importepisodes-middle-div').append(templateCopy);
			templateCopy.show();
			formCount = parseInt(totalItems['importepisodes'].val());
			totalItems['importepisodes'].val(formCount + 1);
		} else {
			parentForm.find('[id^="id_importepisodes"][id$="DELETE"]').val('')
			parentForm.find('[id^="id_importepisodes"][id$="DELETE"]').removeClass('marked-for-deletion')
		}
		parentForm.find('.importepisodes-outer-div').show();
		parentForm.find('.has-episodes-buttons').hide();
		parentForm.find('.no-episodes-buttons').hide();
		updateItems();
		updatePositions();
	})

	/* Hides the import form and marks it for deletion. This way the user can 
	switch to Add Episodes, but can also go back and undelete this form if 
	desired. The marked-for-deletion class ensures that the form stays deleted
	even if the parent entry gets deleted or undeleted. */
	$(document).on('click', '.remove-import', function() {
		button = $(this);
		parentForm = button.closest('[id^="id_"]');
		parentForm.find('[id^="id_importepisodes"][id$="DELETE"]').val(true)
		parentForm.find('[id^="id_importepisodes"][id$="DELETE"]').addClass('marked-for-deletion')
		parentForm.find('.importepisodes-outer-div').hide();
		parentForm.find('.no-episodes-buttons').show();
	})

	// Calls on the separate jquery.swap.js file to swap TL items
	$(document).on('click', '.move-up,.move-down', function() {
		button = $(this)
		if (!button.hasClass('temp-disabled')) {
			const {parentForm} = getButtonData(button)
			button.addClass('temp-disabled')
			if (button.hasClass('move-up')) {
				swapPartners = parentForm.prevAll().filter("div:visible");
			} else if (button.hasClass('move-down')){
				swapPartners = parentForm.nextAll().filter("div:visible");
			}
			itemToSwapWith = swapPartners.first();
			if (itemToSwapWith.length) {
				$('.user-form').addClass('changed-input');
				parentForm.swap(itemToSwapWith, button)
			} else {
				/* We have to remove temp-disabled here, because otherwise if the down 
				button of the lowest item or the up button of the highest item gets
				pressed, then it will get permanently disabled even if the item gets 
				moved up or down later */
				button.removeClass('temp-disabled');
			}
		}
	})

	// Called by deleteItem, undeleteItem, insertItem to finish things up
	function finishItemChanges(button) {
		updateItems();
		updatePositions();
		button.removeClass('temp-disabled');
	}

/* Moves the newly inserted items to the end of the formset upon submission, 
since Django wants formsets to have the old ones with IDs first and the new 
ones without IDs at the end or it will cause an error. Bit of a hack to do it 
in JS, but probably the least bad solution. */
	$('form.timeline-edit-form').submit(function(e) {
		// e.preventDefault();
		$('.episode-list').hide()
		/* To keep the order right, you have to call updatePositions, then reorder 
		the items, then call updateItems */
		updatePositions();
		for (itemType of itemTypes) {
			$('.' + itemType).each(function() {
				if ($(this).find('[name^="' + itemType + '"][name$="id"]').val() == '') {
					$(this).appendTo($('.formset'));
				}
			})
		}
		$('.episode').each(function() {
			if ($(this).find('[name$="id"]').val() == '') {
				$(this).appendTo($('.episode-list').eq(-2));
			}
		})
		updateItems();
	});
});

