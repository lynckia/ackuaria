$(document).ready(function(){
	var filter_count = 0;

	$.fn.toggleDisabled = function() {
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};

	$("#initCalendar").datepicker();
	$("#finalCalendar").datepicker();

	$("#filterCollapse").hide();
	$("#collapseButtonUp").hide();

	$("#configButton, .collapsed").click(function() {
		$("#filterCollapse").toggle();
		$("#collapseButtonUp").toggle();
		$("#collapseButtonDown").toggle();
		$("#searchBar").toggleDisabled();
	})
	
	document.getElementById("initButton").onclick = function(e) {
		$("#initCalendar").focus();
	}
	document.getElementById("finalButton").onclick = function(e) {
		$("#finalCalendar").focus();
	}

	var delete_filter = function(target) {
		$(target).remove();
	}	


	var delete_all_filters = function() {
		for (var i=0; i<=filter_count; i++){
			var target = '#filter_row_' + i;
			console.log(target);
			$(target).remove();
		}
	}

	var new_filter = function() {
		filter_count++;
		$('<div class="row filter_row" id="filter_row_' + filter_count + '"><div class="filters col-md-5"><span>Key </span><input id="key" class="filter" type="text" placeholder="e.g. public"></div><div class="filters col-md-5"><span>Value </span><input id="value" class="filter" type="text" placeholder="e.g. true"></div><div class="filters col-md-2"><span class="button dateIcon fa fa-times removeButton" todelete="filter_row_' + filter_count + '" id="remove_button_' + filter_count + '"></span></div></div>').insertBefore($('#addFilter'));
		$('#remove_button_' + filter_count).click(function() {
			var target = '#' + $(this).attr('todelete');
			delete_filter(target);
		});
	};

	document.getElementById("addButton").onclick = function(e) {
		new_filter();
	}

	$('#remove_button_1').click(function() {
		var target = '#' + $(this).attr('todelete');
		delete_filter(target);
	});
	
	$('#deleteFiltersButton').click(function() {
		delete_all_filters();
	});
	

});