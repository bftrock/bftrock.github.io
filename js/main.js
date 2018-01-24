
var earnedInc, netEarnedInc, unearnedInc, numHousehold, standDeduc;

$(document).ready(function() {
  $("#step2Table input.earnedInc, #step3Table input.unearnedInc").on({
    "change": function () {
      calcIncome();
    }
  });

  $("#step4Table input.deduc").on({
    "change": function () {
      $("#adjustedIncome").val(calcAdjustedIncome());
    }
  });

  calcIncome();
  showDiv("step1");
});

function moveStep1Step2() {
  try {
    numHousehold = getPosInteger($("#numHousehold").val(), false);
    $("#numHousehold").val(numHousehold);
    $("span.nhh").text(numHousehold);
    standDeduc = calcStandardDeduction(numHousehold);
    $("#standDeduc").text(standDeduc);
    if ($("#yesSenior").prop("checked") == true) {
      $("#earnedIncGrossLabel").text("Gross monthly earned income:");
      $("#earnedIncNetRow").show();
    } else {
      $("#earnedIncGrossLabel").text("Total monthly earned income:")
      $("#earnedIncNetRow").hide();
    }
    showDiv("step2");
  }
  catch (err) {
    alert(err);
    $("#numHousehold").focus();
  }
}

function moveStep2Step3() {
  try {
    if (calcIncome())
      showDiv("step3");
  }
  catch (err) {
    alert(err);
    $("#earnedIncWages").focus();
  }
}

function moveStep3Step3a() {
  var tgi = Number($("#incomeTotal").val());
  var gil = round(calcGrossIncomeLimit(numHousehold), 0);
  $("#tgi").text(tgi);
  $("#gil").text(gil);
  if (tgi > gil) {
    elig = "you are not eligible for 3SqauresVT"
    $("#nextStep3a").hide();
  } else {
    elig = "you may proceed to the next step"
    $("#nextStep3a").show();
  }
  $("#eligYesNo").text(elig);
  showDiv("step3a");
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
  try {
    earnedInc = 0;
    earnedInc += getPosNumber($("#earnedIncWages").val());
    earnedInc += getPosNumber($("#earnedIncTrainAllow").val());
    earnedInc += getPosNumber($("#earnedIncSelfFarm").val());
    earnedInc += getPosNumber($("#earnedIncBrdr").val());
    earnedInc += getPosNumber($("#earnedIncRent").val());
    $("#earnedIncGross").val(round(earnedInc, 0));
    netEarnedInc = 0.8 * earnedInc;
    $("#earnedIncNet").val(round(netEarnedInc, 0));
    unearnedInc = 0;
    unearnedInc += getPosNumber($("#unearnedIncBenfits").val());
    unearnedInc += getPosNumber($("#unearnedIncNetRental").val());
    unearnedInc += getPosNumber($("#unearnedIncChildSupAlim").val());
    unearnedInc += getPosNumber($("#unearnedIncDivIntRoy").val());
    unearnedInc += getPosNumber($("#unearnedIncEduc").val());
    unearnedInc += getPosNumber($("#unearnedIncOther").val());
    $("#unearnedIncTotal").val(round(unearnedInc, 0));
    if ($("#yesSenior").prop("checked") == true) {
      totalInc = netEarnedInc + unearnedInc;
    } else {
      totalInc = earnedInc + unearnedInc;
    }
    $("#incomeTotal").val(round(totalInc, 0));
    return true;
  }
  catch (err) {
    alert(err);
    return false;
  }
}

function calcAdjustedIncome() {
  try {
    incBeforeDed = unearnedInc + netEarnedInc;
    var deductions = standDeduc;
    deductions += getPosNumber($("#depCareCosts").val(), true);
    deductions += getPosNumber($("#childSupport").val(), true);
    return Math.max(0, incBeforeDed - deductions);
  }
  catch (err) {
    alert(err);
  }
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

function calcGrossIncomeLimit(numHousehold) {
  return 1.85 * (12060 + (numHousehold - 1) * 4180) / 12;
}

function calcStandardDeduction(numHousehold) {
  var result;
  if (numHousehold > 0 && numHousehold < 4) {
    result = 160;
  } else if (numHousehold == 4) {
    result = 170;
  } else if (numHousehold == 5) {
    result = 199;
  } else {
    result = 228;
  }
  return result;
}
