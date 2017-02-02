/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['singlestim-multichoice-slider'] = (function() {
  var plugin = {};

  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-singlestim-multichoice-slider";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // trial defaults
    trial.stimPreamble =  typeof trial.stimPreamble == 'undefined' ? "" : trial.stimPreamble;
    trial.radioPreamble = typeof trial.radioPreamble == 'undefined' ? "" : trial.radioPreamble;
    trial.sliderPreamble =  typeof trial.sliderPreamble == 'undefined' ? "" : trial.sliderPreamble;
    trial.initial_slider_value =  typeof trial.initial_slider_value == 'undefined' ? 100 : trial.initial_slider_value;
    trial.required =      typeof trial.required == 'undefined' ? null : trial.required;
    trial.horizontal =    typeof trial.required == 'undefined' ? false : trial.horizontal;
    trial.is_html =      (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt =        trial.prompt || "";

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.append($('<form>', {
      "id": trial_form_id
    }));
    var $trial_form = $("#" + trial_form_id);

    // show preamble text
    var stimPreamble_id_name = _join(plugin_id_name, 'stimPreamble');
    $trial_form.append($('<div>', {
      "id": stimPreamble_id_name,
      "class": stimPreamble_id_name
    }));
    $('#' + stimPreamble_id_name).html(trial.stimPreamble) + '<br>';

    if (!trial.is_html) {
      $trial_form.append($('<img>', {
        src: trial.stimulus,
        id: 'jspsych-singlestim-multichoice-slider-stimulus'
      }));
    } else {
      $trial_form.append($('<div>', {
        html: trial.stimulus,
        id: 'jspsych-singlestim-multichoice-slider-stimulus'
      }));
    }

    // show preamble text
    var radioPreamble_id_name = _join(plugin_id_name, 'radioPreamble');
    $trial_form.append($('<div>', {
      "id": radioPreamble_id_name,
      "class": radioPreamble_id_name
    }));
    $('#' + radioPreamble_id_name).html(trial.radioPreamble) + '<br>';

    // add multiple-choice questions
      var i = 0;
      // create question container
      var question_classes = [_join(plugin_id_name, 'question')];
      if (trial.horizontal) {
        question_classes.push(_join(plugin_id_name, 'horizontal'));
      }

      $trial_form.append($('<div>', {
        "id": _join(plugin_id_name, i),
        "class": question_classes.join(' ')
      }));

      var question_selector = _join(plugin_id_selector, i);

      // add question text
      // $(question_selector).append(
      //   '<p class="' + plugin_id_name + '-text singlestim-multichoice-slider">' + trial.questions[i] + '</p>'
      // );

      // create option radio buttons
      $trial_form.append($('<form> oninput="total.value=parseInt()"'));

      var len = trial.options[i].length;
      var arr = createArray(len);
      var sliderMax = 99.9;
      var sliderMin = (100-sliderMax)/(len-1);
      var initial = 100/len;

      function createArray(length) {
      	var array = [];
      	for (var i = 0; i < length; i++) {
      		array.push({ val: initial, slider: null, disp: null});
      	};
      	return array;
      };

      for (var j = 0; j < trial.options[i].length; j++) {
        var option_id_name = _join(plugin_id_name, "option", i, j),
          option_id_selector = '#' + option_id_name;

        // add radio button container
        $(question_selector).append($('<div>', {
          "id": option_id_name,
          "class": _join(plugin_id_name, 'option')
        }));

        // add label and question text
        var option_label = '<label class="' + plugin_id_name + '-text">' + trial.options[i][j] + '</label>';
        $(option_id_selector).append(option_label);

        // create radio button
        var input_id_name = _join(plugin_id_name, 'response', j);
        $(option_id_selector + " label").prepend('<input type="radio" name="' + input_id_name + '" value="' + trial.options[i][j] + '">');

        var slider_name = _join('slider',j);
        var slider_display_name = _join(slider_name,'display');

        var onchangeText = 'document.getElementsByName("'+slider_display_name+'")[0].value=this.value+"%"';
        var sliderValue = 100/trial.options[i].length;
        var sliderDisplayValue = String(parseInt(sliderValue.toFixed(0)))+"%";

         $(option_id_selector + " label").append($('<input>', {
           'type': 'range',
           'name': slider_name,
           'class': 'slider',
           'value': sliderValue,
           'oninput': onchangeText,
           'min': 0,
           'max': 100,
           'step': 1
          }));

        $(option_id_selector + " label").append($('<output type="text" name="'+slider_display_name+'" class= "slider-display">'+sliderDisplayValue+'</output>'));
      };

      if (trial.required && trial.required[i]) {
        // add "question required" asterisk
        $(question_selector + " p").append("<span class='required'>*</span>")

        // add required property
        $(question_selector + " input:radio").prop("required", true);
      };

      // show slider preamble text
      var sliderPreamble_id_name = _join(plugin_id_name, 'sliderPreamble');
      $trial_form.append($('<div>', {
        "id": sliderPreamble_id_name,
        "class": sliderPreamble_id_name
      }));
      $('#' + sliderPreamble_id_name).html(trial.sliderPreamble) + '<br>';

    // add submit button
    $trial_form.append($('<div><p>'));
    $trial_form.append($('<input>', {
      'type': 'submit',
      'id': plugin_id_name + '-next',
      'class': plugin_id_name + ' jspsych-btn',
      'value': 'Submit Answers'
    }));

    $trial_form.submit(function(event) {

      event.preventDefault();

      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      var question_data = {};
      $("div." + plugin_id_name + "-question").each(function(index) {
        var id = "Q" + index;
        var val = $(this).find("input:radio:checked").val();
        var obje = {};
        obje[id] = val;
        $.extend(question_data, obje);
      });

      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "baseBlockOrdered": trial.conditions[0][0],
        "baseBlockRepeat" : trial.conditions[0][1],
        "baseMapOrdered"  : trial.conditions[0][2],
        "baseMapRepeat"   : trial.conditions[0][3],
        "anchoredTarget"  : trial.conditions[0][4],
      };

      display_element.html('');

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
