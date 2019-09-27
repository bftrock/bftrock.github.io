// This javascript module provides all of the code for the functionality of the
// 3SquaresVT Eligibility Calculator. This file must be included for the
// calculator to function.
//
// Copyright 2018 Hunger Free Vermont

// This is where the data that is used in the calculator is defined. This
// should be kept up to date by the maintainer of the calculator. When the
// state releases new numbers, update these values accordingly. This assumes
// that the basic methods for calculating eligibility remain the same, and that
// only the values change. If the methods change, the whole calculator will
// need to be revised and validated.
var data =
{
  "StandardDeduction": {
    "1": 167,
    "2": 167,
    "3": 167,
    "4": 178,
    "5": 209,
    "6": 240
  },
  "ExpandedGrossMonthlyIncome": {
    "1": 1926,
    "2": 2609,
    "3": 3290,
    "4": 3971,
    "5": 4653,
    "6": 5334,
    "7": 6015,
    "8": 6697,
    "9": 7380,
    "10": 8063,
    "Additional": 683
  },
  "MedicalStandardDeduction": 116,
  "MaximumBenefit": {
    "1": 194,
    "2": 355,
    "3": 509,
    "4": 646,
    "5": 768,
    "6": 921,
    "7": 1018,
    "8": 1164,
    "9": 1310,
    "10": 1456,
    "Additional": 146
  },
  "UtilityStandard": {
    "WithHeat": 822,
    "WithoutHeat": 235,
    "PhoneOnly": 36
  },
  "MaximumShelterDeduction": 569
};

// Module-wide variables
var automaticEligible = false;

// This function runs as soon as the page is done loading. It hooks up some of
// the events that fire by user interaction with the calculator. Then it brings
// us to Step 1.
$(document).ready(function() {

  // Assign default values in the calculator from data in the data structure at
  // the top of the file.
  $("#allUtils").prop("value", data.UtilityStandard.WithHeat);
  $("#heatIncluded").prop("value", data.UtilityStandard.WithoutHeat);
  $("#phoneOnly").prop("value", data.UtilityStandard.PhoneOnly);
  $("#stdUtilAllow").text(data.UtilityStandard.WithHeat);

  // Hook up and define the function that runs when the number in household
  // input changes value
  $("#numHousehold").on({
    "change": function() {
      try {
        // Check that it's a positive, non-zero integer and raise an alert if
        // it's not
        getPosInteger($(this).val(), false);
      }
      catch (err) {
        alert(err);
      }
    }
  });

  // Hook up and define the function that runs when any of the earned and
  // unearned income inputs changes value
  $("#step2Table input.earnedInc, #step3Table input.unearnedInc").on({
    "change": function () {
      // When any input changes, calculate the total income
      calcIncome();
    }
  });

  // Hook up and define the function that runs when any of the deduction inputs
  // changes value
  $("#step5Table input").on({
    "change": function () {
      // Calculate adjusted income
      calcAdjustedIncome();
    }
  });

  // Hook up and define the function that runs when any of the shelter cost
  // inputs changes value
  $("#step6Table input.shelt").on({
    "change": function() {
      calcTotalShelterCosts();
    }
  });

  // Default values
  $("#numHousehold").val(1);
  $("#noSenior").prop("checked", true);

  // Hide the table where options for the standard utility allowance are shown.
  // This is not used in Vermont for now, but could change in the future.
  $("#utilAllowTable").hide();

  // Move to the first step of the process
  moveStep1();
});

// Moves us to step 1
function moveStep1() {
  // Show the step 1 div
  showDiv("step1");
}

// Called before we move to step 2
function validateStep1() {
  var result = false;
  try {
    // Ensure that number in household is a positive integer
    numHousehold = getPosInteger($("#numHousehold").val(), false);
    $("#numHousehold").val(numHousehold);
    result = true;
  }
  catch (err)
  {
    alert(err);
  }
  return result;
}

// Moves us to step 2
function moveStep2() {
  if (validateStep1()) {
    // If any of the radio buttons are set to "yes", set the global variable
    // to true
    automaticEligible = $("#yesSenior").prop("checked") ||
                        $("#yesDisabled").prop("checked") ||
                        $("#yesHelp").prop("checked");
    showDiv("step2");
  }
}

// Called before we move to step 3
function validateStep2() {
  return calcIncome();
}

// If step 2 is valid, move to step 3
function moveStep3() {
  if (validateStep2()) {
    showDiv("step3");
  }
}

// Called before we move to step 4
function validateStep3() {
  return calcIncome();
}

// If step 3 is valid, move to step 4.
function moveStep4() {
  if (validateStep3()) {
    if (automaticEligible) {
      $("#incomeTestDiv").hide();
      $("#automaticEligibleDiv").show();
    }
    else {
      $("#automaticEligibleDiv").hide();
      $("#incomeTestDiv").show();
      $("#step4 span.nhh").text($("#numHousehold").val());
      var tgi = Number($("#totalIncome").text());
      var gil = calcGrossIncomeLimit();
      $("#gil").text(gil);
      if (tgi > gil) {
        $("#aboveBelow").text("above");
        $("#proceedYesNo").text("you are not eligible for 3SquaresVT");
        $("#nextstep4").hide();
      } else {
        $("#aboveBelow").text("below");
        $("#proceedYesNo").text("you may be eligible for 3SquaresVT. You may proceed to the next step");
        $("#nextstep4").show();
      }
    }
    showDiv("step4");
  }
}

function moveStep5() {
  $("#step5 span.nhh").text($("#numHousehold").val());
  if ($("#yesSenior").prop("checked") || $("#yesDisabled").prop("checked")) {
    $("#medExpRow").show();
    $("#medDedRow").show();
  } else {
    $("#medExpRow").hide();
    $("#medDedRow").hide();
  }
  calcAdjustedIncome();
  showDiv("step5");
}

function validateStep5() {
  return calcAdjustedIncome();
}

function moveStep6() {
  if (validateStep5()) {
    calcTotalShelterCosts();
    showDiv("step6");
  }
}

function validateStep6() {
  return calcTotalShelterCosts();
}

function moveStep7() {
  if (validateStep6()) showDiv("step7");
}

function showDiv(stepId) {
  $(".stepDiv").each(function (index) {
    if (this.id == stepId) {
      $(this).show()
    }
    else {
      $(this).hide()
    }
  })
}

function calcIncome() {
  var offendingInput;
  try {
    var earnedInc = 0;
    var offendingInput;
    $("#step2Table input.earnedInc").each(function() {
      offendingInput = $(this);
      earnedInc += getPosNumber($(this).val());
    });
    $("#grossEarnedInc").text(round(earnedInc, 0));
    var netEarnedInc = 0.8 * earnedInc;
    $("#netEarnedInc").text(round(netEarnedInc, 0));
    var unearnedInc = 0;
    $("#step3Table input.unearnedInc").each(function() {
      offendingInput = $(this);
      unearnedInc += getPosNumber($(this).val());
    });
    $("#unearnedIncTotal").text(round(unearnedInc, 0));
    totalInc = earnedInc + unearnedInc;
    $("#totalIncome").text(round(totalInc, 0));
    return true;
  }
  catch (err) {
    alert(err);
    offendingInput.focus();
    return false;
  }
}

function calcAdjustedIncome() {
  var result = false;
  try {
    var netEarnedInc = Number($("#netEarnedInc").text());
    var unearnedInc = Number($("#unearnedIncTotal").text());
    var incBeforeDed = unearnedInc + netEarnedInc;
    var standardDeduc = calcStandardDeduction();
    var totalDeduc = standardDeduc;
    var offendingInput;
    $("#step5Table input.deduc").each(function() {
      offendingInput = $(this);
      totalDeduc += getPosNumber($(this).val(), true);
    });
    medicalDeduc = calcMedicalDeduction();
    totalDeduc += medicalDeduc;
    adjustedIncome =  round(Math.max(0, incBeforeDed - totalDeduc), 0);
    $("#standardDeduc").text(round(standardDeduc, 0));
    $("#medicalDeduc").text(round(medicalDeduc, 0));
    $("#totalDeduc").text(round(totalDeduc, 0));
    $("#adjustedIncome").text(round(adjustedIncome, 0));
    result = true;
  }
  catch (err) {
    alert(err);
    offendingInput.focus();
  }
  return result;
}

function calcGrossIncomeLimit() {
  var key = $("#numHousehold").val()
  var nHousehold = Number(key);
  var grossIncLim = 0;
  if (nHousehold < 11) {
    grossIncLim = data.ExpandedGrossMonthlyIncome[key]
  }
  else {
    grossIncLim = data.ExpandedGrossMonthlyIncome["10"] + (nHousehold - 10) * data.ExpandedGrossMonthlyIncome.Additional;
  }
  return grossIncLim;
}

function calcStandardDeduction() {
  var result;
  var key = $("#numHousehold").val()
  var nHousehold = Number(key);
  if (nHousehold < 6) {
    result = data.StandardDeduction[key]
  } else {
    result = data.StandardDeduction["6"];
  }
  return result;
}

function calcMedicalDeduction() {
  medicalExpenses = Number($("#medicalExpenses").val());
  medicalDeduc = 0;
  if ((medicalExpenses >= 35) && (medicalExpenses <= 151)) {
    medicalDeduc = data.MedicalStandardDeduction;
  } else if (medicalExpenses > 151) {
    medicalDeduc = medicalExpenses - 35;
  }
  return medicalDeduc;
}

function calcTotalShelterCosts() {
  var result = false;
  var offendingInput;
  try {
    var shelterCosts = 0;
    $("#step6Table input.shelt").each(function(i) {
      offendingInput = $(this);
      shelterCosts += getPosNumber($(this).val(), true);
    });
    shelterCosts += Number($("#stdUtilAllow").text());
    $("#totSheltCosts").text(round(shelterCosts, 0));
    var adjustedIncome = Number($("#adjustedIncome").text());
    var excessShelterCost = shelterCosts - adjustedIncome / 2;
    shelterDeduc = Math.max(0, excessShelterCost);
    if ($("#yesSenior").prop("checked") == false) {
      shelterDeduc = Math.min(shelterDeduc, data.MaximumShelterDeduction);
    }
    $("#shelterDeduc").text(shelterDeduc);
    var monthlyNetInc = Math.max(0, adjustedIncome - shelterDeduc);
    $("#monthlyNetInc").text(monthlyNetInc);
    var beneAllot = calcBenefitAllotment(monthlyNetInc);
    if (beneAllot > 0) {
      $("#isEligible").show();
      $("#notEligible").hide();
      $("#benefitAllot").text(calcBenefitAllotment(monthlyNetInc));
    } else {
      $("#isEligible").hide();
      $("#notEligible").show();
    }
    result = true;
  }
  catch (err) {
    alert(err);
    offendingInput.focus();
  }
  return result;
}

function calcBenefitAllotment(monthlyNetInc) {
  var key = $("#numHousehold").val();
  var nHousehold = Number(key);
  var maxBenefit = 0;
  var benefit = 0;
  if (nHousehold < 11) {
    maxBenefit = data.MaximumBenefit[key];
  }
  else {
    maxBenefit = data.MaximumBenefit["10"] + (nHousehold - 10) * data.MaximumBenefit.Additional;
  }
  if (monthlyNetInc <= 0) {
    benefit = maxBenefit;
  }
  else {
    benefit = maxBenefit - (0.3 * monthlyNetInc);
    if (benefit < 15) {
      if ((nHousehold == 1 && monthlyNetInc < 1671) ||
          (nHousehold == 2 && monthlyNetInc < 2267)) {
        benefit = 15;
      }
      else {
        benefit = Math.max(0, benefit);
      }
    }
  }
  benefit = Math.floor(benefit);
  return benefit;
}

function getNumber(value) {
  if (value == "") throw "Value cannot be empty.";
  if (isNaN(value)) throw "Value must be a number.";
  return Number(value);
}

function getPosInteger(value, allowZero = true) {
  var x = getPosNumber(value, allowZero);
  return parseInt(x);
}

function getPosNumber(value, allowZero = true) {
  var x = getNumber(value);
  if (allowZero) {
    if (x < 0) throw "Value cannot be negative.";
  } else {
    if (x <= 0) throw "Value cannot be negative or zero.";
  }
  return Number(value);
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
