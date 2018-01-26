
var numHousehold, hasSenior;
var earnedInc, netEarnedInc, unearnedInc, incBeforeDed;
var standDeduc, totalDeduc, adjustIncome;

$(document).ready(function() {
  $("#step2Table input.earnedInc, #step3Table input.unearnedInc").on({
    "change": function () {
      calcIncome();
    }
  });

  $("#step5Table input.deduc").on({
    "change": function () {
      $("#adjustedIncome").val(calcAdjustedIncome());
    }
  });

  moveStep1();
});

function moveStep1() {
  $("#numHousehold").val(1);
  $("#noSenior").prop("checked", true);
  showDiv("step1");
}

function validateStep1() {
  var result = false;
  try {
    numHousehold = getPosInteger($("#numHousehold").val(), false);
    $("#numHousehold").val(numHousehold);
    hasSenior = $("#yesSenior").prop("checked")
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
    if (hasSenior == true) {
      $("#grossEarnedIncLabel").text("Gross monthly earned income:");
      $("#netEarnedIncRow").show();
      $("#step2FootNote").show();
    } else {
      $("#grossEarnedIncLabel").text("Total monthly earned income:")
      $("#netEarnedIncRow").hide();
      $("#step2FootNote").hide();
    }
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
    $("#step4 span.nhh").text(numHousehold);
    var tgi = round(totalInc, 0);
    var gil = round(calcGrossIncomeLimit(numHousehold), 0);
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
  standDeduc = calcStandardDeduction(numHousehold);
  totalDeduc = calcTotalDeduction();
  adjustIncome = calcAdjustedIncome();
  $("#standDeduc").text(standDeduc);
  $("#totalDeduc").text(totalDeduc);
  $("#adjustIncome").text(adjustIncome);
  showDiv("step5");
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
    earnedInc = 0;
    $("#step2Table input.earnedInc").each(function() {
      offendingInput = $(this);
      earnedInc += getPosNumber($(this).val());
    });
    $("#grossEarnedInc").text(round(earnedInc, 0));
    netEarnedInc = 0.8 * earnedInc;
    $("#netEarnedInc").text(round(netEarnedInc, 0));
    unearnedInc = 0;
    $("#step3Table input.unearnedInc").each(function() {
      offendingInput = $(this);
      unearnedInc += getPosNumber($(this).val());
    });
    $("#unearnedIncTotal").text(round(unearnedInc, 0));
    if (hasSenior == true) {
      totalInc = netEarnedInc + unearnedInc;
    } else {
      totalInc = earnedInc + unearnedInc;
    }
    $("#incomeTotal").text(round(totalInc, 0));
    return true;
  }
  catch (err) {
    alert(err);
    offendingInput.focus();
    return false;
  }
}

function calcAdjustedIncome() {
  try {
    incBeforeDed = unearnedInc + netEarnedInc;
    var deductions = standDeduc;
    $("step5Table input.deduc").each(function() {
      deductions += getPosNumber($(this).val(), true);
    });
    return Math.max(0, incBeforeDed - deductions);
  }
  catch (err) {
    alert(err);
  }
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

function calcTotalDeduction() {
  var result = standDeduc;
  try {
    
  }
  catch (err) {

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
