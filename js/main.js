
$( document ).ready(function() {
    $("#nextStep1").click(function() {
      if (validateStep1()) {
        loadStep2();
        showStep("step2");
      }
    });
  
    $("#prevStep2").click(function() {
      showStep("step1");
    });
  
    $("#nextStep2").click(function() {
      showStep("step3");
    });
  
    $("#prevStep3").click(function() {
      showStep("step2");
    });
  
    $("#step2Table input.earnedInc, #step3Table input.unearnedInc").on({
      "change": function () {
        calcIncome();
      }
    });
  
    calcIncome();
    showStep("step1");
  });
  
  function loadStep2()
  {
    if ($("#yesSenior").prop("checked") == true) {
      $("#earnedIncGrossLabel").text("Gross monthly earned income:");
      $("#earnedIncNetRow").show();
    } else {
      $("#earnedIncGrossLabel").text("Total monthly earned income:")
      $("#earnedIncNetRow").hide();
    }
  }
  
  function validateStep1() {
    isValid = true;
    numHousehold = $("#numHousehold").val()
    if (isNaN(numHousehold)) {
      alert("You must enter a number.");
      isValid = false;
    }
    else {
      if (numHousehold < 1) {
        alert("You must enter a number greater than or equal to 1.");
        isValid = false;
      }
    }
    return isValid;
  }
  
  function showStep(stepId) {
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
    var earnedInc = 0;
    earnedInc += Number($("#earnedIncWages").val());
    earnedInc += Number($("#earnedIncTrainAllow").val());
    earnedInc += Number($("#earnedIncSelfFarm").val());
    earnedInc += Number($("#earnedIncBrdr").val());
    earnedInc += Number($("#earnedIncRent").val());
    $("#earnedIncGross").val(round(earnedInc, 0));
    netErndInc = 0.8 * earnedInc;
    $("#earnedIncNet").val(round(netErndInc, 0));
    var unearnedInc = 0;
    unearnedInc += Number($("#unearnedIncBenfits").val());
    unearnedInc += Number($("#unearnedIncNetRental").val());
    unearnedInc += Number($("#unearnedIncChildSupAlim").val());
    unearnedInc += Number($("#unearnedIncDivIntRoy").val());
    unearnedInc += Number($("#unearnedIncEduc").val());
    unearnedInc += Number($("#unearnedIncOther").val());
    $("#unearnedIncTotal").val(round(unearnedInc, 0));
    if ($("#yesSenior").prop("checked") == true) {
      totalInc = netErndInc + unearnedInc;
    } else {
      totalInc = earnedInc + unearnedInc;
    }
    $("#incomeTotal").val(round(totalInc, 0));
  }
  
  function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }
  
  function fpl(value) {
    return 12060 + value * 4180;
  }