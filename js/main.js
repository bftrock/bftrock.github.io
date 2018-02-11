var data = 
{
  "StandardDeduction": {
    "1": 160,
    "2": 160,
    "3": 160,
    "4": 170,
    "5": 199,
    "6": 228
  },
  "ExpandedGrossMonthlyIncome": {
    "1": 1860,
    "2": 2505,
    "3": 3149,
    "4": 3793,
    "5": 4439,
    "6": 5082,
    "7": 5762,
    "8": 6372,
    "9": 7018,
    "10": 7633,
    "Additional": 646
  },
  "MedicalStandardDeduction": 138,
  "MaximumBenefit": {
    "1": 192,
    "2": 352,
    "3": 504,
    "4": 640,
    "5": 760,
    "6": 913,
    "7": 1009,
    "8": 1153,
    "9": 1297,
    "10": 1441,
    "Additional": 144    
  },
  "UtilityStandard": {
    "WithHeat": 808,
    "WithoutHeat": 232,
    "PhoneOnly": 36
  }
};

var automaticEligible = false;

$(document).ready(function() {
  $("#allUtils").prop("value", data.UtilityStandard.WithHeat);
  $("#heatIncluded").prop("value", data.UtilityStandard.WithoutHeat);
  $("#phoneOnly").prop("value", data.UtilityStandard.PhoneOnly);
  $("#stdUtilAllow").text(data.UtilityStandard.WithHeat);

  $("#numHousehold").on({
    "change": function() {
      try {
        getPosInteger($(this).val(), false);
      }
      catch (err) {
        alert(err);
      }
    }
  });

  $("#step2Table input.earnedInc, #step3Table input.unearnedInc").on({
    "change": function () {
      calcIncome();
    }
  });

  $("#step5Table input").on({
    "change": function () {
      calcAdjustedIncome();
    }
  });

  $("#step6Table input.shelt").on({
    "change": function() {
      calcTotalShelterCosts();
    }
  });

  $("#utilAllowTable input").change(function () {
    $("#stdUtilAllow").text(this.value);
    calcTotalShelterCosts();
  })

  $("#numHousehold").val(1);
  $("#noSenior").prop("checked", true);
  moveStep1();
});

function moveStep1() {
  showDiv("step1");
}

function validateStep1() {
  var result = false;
  try {
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

function moveStep2() {
  if (validateStep1()) {
    automaticEligible = $("#yesSenior").prop("checked") ||
                        $("#yesDisabled").prop("checked") ||
                        $("#yesHelp").prop("checked");
    showDiv("step2");
  }
}

function validateStep2() {
  var result = false;
  if (calcIncome()) {
    result = true;
  }
  return result;
}

function moveStep3() {
  if (validateStep2()) {
    showDiv("step3");
  }
}

function validateStep3() {
  var result = false;
  if (calcIncome()) {
    result = true;
  }
  return result;
}

function moveStep4() {
  if (validateStep3()) {
    $("#step4 span.nhh").text($("#numHousehold").val());
    var tgi = Number($("#totalIncome").text());
    var gil = calcGrossIncomeLimit();
    $("#tgi").text(tgi);
    $("#gil").text(gil);
    if (tgi > gil) {
      $("#aboveBelow").text("above");
      $("#proceedYesNo").text("you are not eligible for 3SquaresVT");
      $("#nextstep4").hide();
    } else {
      $("#aboveBelow").text("below");
      $("#proceedYesNo").text("you may proceed to the next step");
      $("#nextstep4").show();
    }
    showDiv("step4");
  }
}

function moveStep5() {
  $("#step5 span.nhh").text($("#numHousehold").val());
  if ($("#yesSenior").prop("checked")) {
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
  var result = false;
  if (calcAdjustedIncome()) {
    result = true;
  }
  return result;
}

function moveStep6() {
  if (validateStep5()) {
    calcTotalShelterCosts();
    showDiv("step6");
  }
}

function validateStep6() {
  var result = false;
  if (calcTotalShelterCosts()) {
    result = true;
  }
  return result;
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
    var hasSenior = $("#yesSenior").prop("checked");
    if (hasSenior == true) {
      totalInc = netEarnedInc + unearnedInc;
    } else {
      totalInc = earnedInc + unearnedInc;
    }
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
    var unearnedInc = Number($("#unearnedInc").text());
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
  if (medicalExpenses >= 35 && medicalExpenses <= 173) {
    medicalDeduc = data.MedicalStandardDeduction;
  } else if (medicalExpenses > 173) {
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
      shelterDeduc = Math.min(shelterDeduc, 504);
    }
    $("#shelterDeduc").text(shelterDeduc);
    var monthlyNetInc = adjustedIncome - shelterDeduc;
    $("#monthlyNetInc").text(monthlyNetInc);
    $("#benefitAllot").text(calcBenefitAllotment(monthlyNetInc));
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
    benefit = maxBenefit - Math.ceil(0.3 * monthlyNetInc);
  }
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
