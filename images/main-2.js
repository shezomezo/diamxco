// Function not in utility class in order to allow this javascript library to be stand-alone.
function getURLParameter(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
        return "";
    }
    else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

function prePopopulateCityAndState(postalCode) {
    rolClientV1.doCmd('Geography.svc/GetPostalCodeData', function () { }, 'prePopopulateCityAndState_Callback', {
        postalCode: postalCode
    });
}

function prePopopulateCityAndState_Callback(response) {
    $("#cityTextBox").val(response.d.City); $("#stateDropDown").val(response.d.ProvinceAbbreviation);
}

function getWeekDay(date) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
}
function getMonth(date) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[date.getMonth()]
}

function nextServiceDateLookUp() {
    var zipcode = $('#zipCodeTextBox').val();
    var nextDays = $('#nextDays').val();
    if (zipcode) {
        rolClientV1.doCmd('BranchService.svc/GetNextAvailableServiceDates', function () { }, 'nextServiceDateLookUp_Callback', {
            postalCode: zipcode,
            serviceId: 'tc',
            nextDays: (nextDays) ? nextDays : 3
        });
    }
}

function nextServiceDateLookUp_Callback(response) {
    $('#AppointmentDate option').remove();
    for (var i = 0; i < response.d.length; i++) {
        var jsonDate = response.d[i];  // returns "/Date(1245398693390)/";
        var re = /-?\d+/;
        var m = re.exec(jsonDate);
        var date = new Date(parseInt(m[0])); // Date is UTC
        var adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Add back the offset
        var dateValue = adjustedDate.getMonth() + 1 + "/" + adjustedDate.getDate() + "/" + adjustedDate.getFullYear();
        var dateValue2 = getWeekDay(adjustedDate) + ', ' + getMonth(adjustedDate) + ' ' + adjustedDate.getDate();
        var option = "<option value=" + dateValue + ">" + dateValue2 + "</option>";
        $('#AppointmentDate').append(option);
    }
}

$(document).ready(function () {

    // Begin input field population

    var qsFirstName = getURLParameter("FirstName");
    if (qsFirstName && qsFirstName.length > 0) {
        $("#firstNameTextBox").val(qsFirstName);
    }

    var qsLastName = getURLParameter("LastName");
    if (qsLastName && qsLastName.length > 0) {
        $("#lastNameTextBox").val(qsLastName);
    }

    var qsIndustry = getURLParameter("Industry");
    if (qsIndustry && qsIndustry.length > 0) {
        $("#industryDropDown").val(qsIndustry);
    }

    var qsAdditionalData = getURLParameter("AdditionalData");
    if (qsAdditionalData && qsAdditionalData.length > 0) {
        $("#Data1TextBox").val(qsAdditionalData);
    }

    var qsPostalCode = getURLParameter("PostalCode");
    if (qsPostalCode && qsPostalCode.length > 0) {
        $("#zipCodeTextBox").val(qsPostalCode);
        prePopopulateCityAndState(qsPostalCode);
    }

    // Sets the next available service dates of the AppointmentDate input field is available
    if ($('#AppointmentDate').length) {
        nextServiceDateLookUp();
        $('#zipCodeTextBox').blur(function () {
            nextServiceDateLookUp();
        });
    }

    // End input field population

    // Begin Validation

    var isCallCraig = (document.location.href.indexOf('signup.callcraig.com') > -1);
    var isGotoHydrex = (document.location.href.indexOf('signup.gotohydrex.com') > -1);
    var isWaltham = (document.location.href.indexOf('signup.walthamservices.com') > -1);
    var isOrkin = (document.location.href.indexOf('signup.orkin.com') > -1);
    var isHomeTeam = (document.location.href.indexOf('signup.pestdefense.com') > -1);
    var isCanada = (document.location.href.indexOf('orkincanada.ca') > -1)
    var isPrz = (document.location.href.indexOf('pestremovalzone.com') > -1);
    var isWesternpest = (document.location.href.indexOf('signup.westernpest.com') > -1);

    var isUSA = isCallCraig || isWaltham || isOrkin || isHomeTeam || isPrz || isGotoHydrex || isWesternpest;

    //Check if a browser has built-in HTML5 form validation?
    if (typeof document.createElement("input").checkValidity == "function") {

        if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            noneHTML5validation();
        }
        else {
            html5Validation();
            $("#firstNameTextBox").attr("pattern", "[A-Za-z. ]{1,100}");
            $("#lastNameTextBox").attr("pattern", "[A-Za-z. ]{1,100}");
            $("#address1TextBox").attr("pattern", "[A-Za-z. 0-9,-]{1,100}");
            $("#address2TextBox").attr("pattern", "[A-Za-z. 0-9,-]{1,100}");
            $("#emailAddressTextBox").attr("pattern", "^[a-zA-Z0-9'@&#.\s]{1,100}$");
            $("#cityTextBox").attr("pattern", "[A-Za-z. ]{1,100}");
            //$("#zipCodeTextBox").attr("pattern", "[0-9]{1,5}");
            //$("#phone1TextBox").attr("pattern", "[0-9]{3}-?[0-9]{3}-?[0-9]{4}");
            //$("#phone2TextBox").attr("pattern", "[0-9]{3}-?[0-9]{3}-?[0-9]{4}");
            
            if (isUSA) {
                $('#zipCodeTextBox').attr("pattern", "[0-9]{5}");
            }
            if (isCanada) {
                $('#zipCodeTextBox').attr("pattern", "[A-Za-z0-9 ]{3,10}");
            }
            if (!isUSA) {
                if (!isCanada) {
                    $("#zipCodeTextBox").attr("pattern", "[0-9]{1,10}");
                    $("#phone1TextBox").attr("pattern", "[0-9]{1,15}");
                    $("#phone2TextBox").attr("pattern", "[0-9]{1,15}");
                    $("#emailAddressTextBox").attr("pattern", "^[a-zA-Z0-9'@&#.\s]{1,100}$");
                }
            }
        }
    }
    else {
        noneHTML5validation(isCanada);
    }

    function html5Validation() {
        $('#firstNameTextBox').attr('pattern', '^[A-Za-z. ]+$');
        $('#lastNameTextBox').attr('pattern', '^[A-Za-z. ]+$');
        $('#emailAddressTextBox').attr('placeholder', 'Email');

        if (isUSA || isCanada) {
            $('[id^=phone]').attr({ 'pattern': '[0-9]{3}-?[0-9]{3}-?[0-9]{4}', 'placeholder': 'Phone' });
        }
        if (isUSA) {
            $('#zipCodeTextBox').attr({ 'pattern': "[0-9]{5}", 'placeholder': 'Zip Code' });
        }
    }

    function noneHTML5validation() {
        //use validation lougin to handle none-html5 validations
        $('#formBox form, form#lead').validate();
        if (isUSA || isCanada) {
            $('[id^=phone]').addClass('phoneUS');
        }
        if (isUSA) {
            $('#zipCodeTextBox').addClass('zipcode');
        }
        if (isCanada) {
            $('#zipCodeTextBox').addClass('');
        }
        $('#emailAddressTextBox').addClass('email');
    }

    //Add US zipcode validation for the none HTML5 plugin
    jQuery.validator.addMethod("zipcode", function (zip) {
        zip = zip.replace(/^\s+/, "");
        zip = zip.replace(/\s+$/, "");

        if (zip.length == 0) {
            return true;
        }

        // allow either five digits or nine digits with an optional '-' between
        if (zip.match(/^\d{5}([- ]?\d{4})?$/)) {
            return true;
        }
        return false;
    }, "Please specify a valid US zip code");

    //Add phone number validaton for the none HTML5 plugin
    jQuery.validator.addMethod("phoneUS", function (phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, "");
        return this.optional(element) ||
            phone_number.length > 9 &&
            phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
    }, "Please specify a valid phone number");

    jQuery.validator.addMethod("email", function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }, "Please specify a valid email address");

    // End Validation

    // Begin Submission

    function handleSubmit(submitBtn) {
        var errorMsg = "Please Wait...";
        if ($('.btn_primary').hasClass('es')) {
            errorMsg = "Por favor espere...";
        }
        submitBtn.hide();
        submitBtn.parent().append('<div style="font-size:15pt;color:#cc0000;font-weight:bold; text-align:center">' + errorMsg + '</div>');
    }

    $('#orkin_form input[type=submit], form#lead input[type=submit]').click(function () {
        //html5     
        if (typeof document.createElement("input").checkValidity == "function") {
            if ($('#orkin_form, form#lead')[0].checkValidity() == true) {
                handleSubmit($(this));
            }
        }
        else {
            //plugin
            if ($('#orkin_form, form#lead').valid()) {
                handleSubmit($(this));
            }
        }
    });

    // End Submission

    //Sets service line for residential bootstrap 2013 theme
    $('#havetermites').change(function () {
        if ($(this).is(':checked')) {
            $('#ServiceLine_').attr('name', 'ServiceLine_TC').val('TC');
        }
        else {
            $('#ServiceLine_').attr('name', 'ServiceLine_PC').val('PC');
        }
    });

    // mobile schedule now control click animates and focuses to the first form field
    $('#scheduleNowForm a').on('click', function (e) {
        var firstInput = $('#orkin_form input:first, form#lead input:first');
        $('body').animate({ "scrollTop": firstInput.closest('form').offset().top }, 200);
        e.preventDefault();
        $('#orkin_form input:first, form#lead input:first').focus();
    });

    var theDate = new Date();
    $('footer span.copyyear').text(theDate.getFullYear());

    $('#ServiceLine_PC').change(function () {
        $('#termiteOnly').slideUp('slow');
    });

    $('#ServiceLine_TC').change(function () {
        $('#termiteOnly').slideDown('slow');
    });

    $('.noForm').parents('html, body').css({ 'height': '100%' });

    //$("input:text:first").focus();

    //new code to check if page is being visited from browser
    var isMobile = (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Windows Phone/i.test(navigator.userAgent)) ? true : false;
    //alert(isMobile);
    if (!isMobile) {
        $("input:text:first").focus();
    }

    $('#privacy').click(function (event) {
        var url = $(this).attr("href");
        var windowName = "popUp";
        var width = "300", height = "400";
        if (isHomeTeam) { width = "600"; height = "700"; }
        var windowSize = "width=" + width + ",height=" + height + ",scrollbars=yes";
        window.open(url, windowName);
        event.preventDefault();
    });

    $('a.home').attr('href', window.location.protocol + "//" + window.location.host + "/");
});