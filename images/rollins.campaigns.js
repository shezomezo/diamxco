var adidKey = "rol_adid";

var avid_phone_replace = "";

var invalidadid = "";
var defaultadid = "";
var emptyReferrer = "";
var replacePhoneWithAvidTrakId = true;


function insertInvocaTrackScript() {
    $('<script> \
        (function (i, n, v, o, c, a) { \
            i.InvocaTagId = o;\
            var s = n.createElement("script");\
            s.type = "text/javascript"; s.async = true; \
            s.src = ("https:" === n.location.protocol ? "https://" : "http://") + v; \
            var fs = n.getElementsByTagName("script")[0]; fs.parentNode.insertBefore(s, fs); \
        })(window, document, "solutions.invocacdn.com/js/pnapi_integration-latest.min.js", "1634/1420886890"); \
    </script >').appendTo(document.body);
}

function insertAvidTrakScript(avidTrakId) {
    $('<script type="text/javascript"> \
        var _atq = _atq || []; \
        (function () { \
            var __ats = document.createElement("script"); __ats.type = "text/javascript"; __ats.async = true; \
            __ats.src = ("https:" == document.location.protocol ? "https://" : "http://") + "rollins.avidtrak.com/' + avidTrakId + '/track.js"; \
            var __spn = document.getElementsByTagName("script")[0]; __spn.parentNode.insertBefore(__ats, __spn); \
        })(); \
    </script>').appendTo(document.body);
}


function insertFallBackScript() {
    // This is fallback mechanism if the phone is replaced with the AvidTrakId and the appropriate AvidTrak script isn't added to the page.
    $('<script type="text/javascript"> \
        var isTelAvidId = $(".tel").attr("href") && $(".tel").attr("href").split(":")[1].length > 20;\
        var isDynTelAvidId = $(".dyn-tel").closest("a").attr("href") && $(".dyn-tel").closest("a").attr("href").split(":")[1].length > 20;\
        if (isTelAvidId || isDynTelAvidId) {\
            $(".tel").each(function () {\
                $(this).text("844-514-3980");\
                $(this).attr("href", "tel:844-514-3980");\
            });\
            $(".dyn-tel").each(function () {\
                $(this).text("844-514-3980");\
                $(this).closest("a").attr("href", "tel:844-514-3980");\
            });\
            $(".telNoText").each(function () { $(this).attr("href", "tel:844-514-3980"); });\
        }\
    </script>').appendTo(document.body);
}


function getAdid(referrer, isMobile) {
    var adid = getURLParameter('utm_campaign');
    if (adid == null || adid == "") {
        var cm_mmc = getURLParameter('cm_mmc');
        if (cm_mmc != '') {
            var substr = cm_mmc.split('-_-');
            $.each(substr, function () {
                // Campaign is only all-UPPER cm_mmc parameter that has more than 1 character.  Eliminates "_" as a code.
                if (this == this.toUpperCase() && this.length > 1) {
                    adid = this.trim();
                }
            });
        }

        if (adid == null || adid == "") {
            adid = getURLParameter('rcsccode');
            if (adid == null || adid == "") {
                adid = getURLParameter('adid');
                if (adid == null || adid == "") {
                    if (supports_html5_storage()) {
                        adid = localStorage.getItem(adidKey);
                        if (adid == null || adid == "") {
                            // TODO: Move to orkin.com javascript, call before executing the injectCampaignInfo plugin
                            adid = defaultadid;

                            if (adid == "GNAT0189") {
                                // pass in the referer and isMobile params for testing.
                                referrer = (!referrer) ? document.referrer : referrer;

                                isMobile = (!isMobile) ?
                                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) //http://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-handheld-device-in-jquery
                                    : isMobile;

                                var isYahooOrganic = referrer.indexOf("search.yahoo.com") != -1;
                                var isBingMSNOrganic = referrer.indexOf("bing.com") != -1;
                                var isGoogleOrganic = referrer.indexOf("google.") != -1;
                                var isGoogleMobileOrganic = isGoogleOrganic && isMobile;

                                var isSearch = isYahooOrganic || isBingMSNOrganic || isGoogleOrganic || isGoogleMobileOrganic;

                                var isOtherOrganic = !isSearch && referrer != emptyReferrer;
                                var isOtherMobileOrganic = isOtherOrganic && isMobile;

                                var isDirect = !isSearch && referrer == emptyReferrer;
                                var isMobileDirect = isDirect && isMobile;

                                if (isYahooOrganic) { return "GAOWEB"; }
                                if (isBingMSNOrganic) { return "GAMWEB"; }
                                if (isGoogleMobileOrganic) { return "GNAT0600"; }
                                if (isGoogleOrganic) { return "GAGWEB"; }
                                if (isOtherMobileOrganic) { return "MO0111"; }
                                if (isOtherOrganic) { return "GAFWEB"; }
                                if (isMobileDirect) { return "GNAT0599"; }
                                if (isDirect) { return "GARWEB"; }
                            }
                        }
                    }
                    else {
                        adid = defaultadid;
                    }
                }
            }
        }
    }
    return adid;
}

function setCampaignValuesFromApi(adid) {
    //rolClientV1.doCmd('WebServices/Campaigns.svc/json/CampaignById', function () { }, 'campaignDataLoaded', {
    //    campaignId: adid
    //});

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: 'https://locator.rollins.com/WebServices/Campaigns.svc/json/CampaignById?campaignId='+adid,
        dataType: "json",
        async: true,
        success: function (result) {
            // alert("Data has been added successfully.");  
            campaignDataLoaded(result);
        },
        error: function () {
            //alert("Error while inserting data");
        }
    });  
}

function campaignDataLoaded(result) {
    if (!result) {
        // if the result doesn't contain any campaign info and an invalidadid is available, try again
        if (invalidadid) {
            //insertInvocaTrackScript();
            setCampaignValuesFromApi(invalidadid);
        }
        return;
    }

    var campaign = {
        "phone": result.d.PhoneNumber,
        "adid": result.d.MarketingCampaignId,
        "pcOffer": result.d.PcOfferHtml,
        "tcOffer": result.d.TcOfferHtml,
        "pcDisclaimer": result.d.PcOfferDisclaimerHtml,
        "tcDisclaimer": result.d.TcOfferDisclaimerHtml,
        "useavidtrak": (result.d.PhoneNumber.length > 20)
    };

    if (supports_html5_storage()) {
        setAdidInStorage(campaign.adid);
    }
    setCampaignValuesOnPage(campaign);
}

function setLegacyCampaignValuesOnPage(campaign) {
    var isPc = ($('input[name$="ServiceLine"][value="PC"]').length > 0);
    var isTc = ($('input[name$="ServiceLine"][value="TC"]').length > 0);
    // the page should be a funnel if it has a radio button group named Service Line with values for PC and TC.
    // the page should ALSO be a funnel if it has hidden fields for Service Line with values for PC and TC.
    // This is because no form landing pages include hidden fields on a form to indicate their Service Lines.
    var isFunnel =
        (($('input[type="radio"][name$="ServiceLine"][value="TC"]').length > 0) &&
        ($('input[type="radio"][name$="ServiceLine"][value="PC"]').length > 0)) ||
        (($('input[type="hidden"][name$="ServiceLine"][value="TC"]').length > 0) &&
        ($('input[type="hidden"][name$="ServiceLine"][value="PC"]').length > 0));

    // Determine ServiceLine
    var campaignPcOffer = (campaign.pcOffer != "&amp;nbsp;") && (campaign.pcOffer != "&nbsp;");
    var campaignTcOffer = (campaign.tcOffer != "&amp;nbsp;") && (campaign.tcOffer != "&nbsp;");

    // Based on ServiceLine, construct the offer and disclaimer html 
    var disclaimer = "", offer = "";
    if (isFunnel && campaignPcOffer && campaignTcOffer) {
        offer = campaign.pcOffer + " or<br />" + campaign.tcOffer;
        disclaimer = campaign.pcDisclaimer + "<br />" + campaign.tcDisclaimer;
    } else if (isPc) {
        offer = campaign.pcOffer;
        disclaimer = campaign.pcDisclaimer;
    } else if (isTc) {
        offer = campaign.tcOffer;
        disclaimer = campaign.tcDisclaimer;
    }

    if (replacePhoneWithAvidTrakId) {
        $("span[campaign=phone]").html(campaign.phone);
    }
    $("span[campaign=offer]").html(offer);
    $("span[campaign=disclaimer]").html(disclaimer);

    // inject the campaign id onto any anchor tag on the page which has campaign attribute set to "id"
    $("a[campaign=id]").each(function () {
        var href = $(this).attr('href');
        var subhref = href.split('?');
        href = subhref[0] + "?adid=" + campaign.adid;
        if (subhref[1])
            href += "&" + subhref[1];
        $(this).attr('href', href);
    });
}

function replaceCampaignValueIfAvailable(value, element) {
    if (value && value !== '&nbsp;') {
        element.html(value);
    }
    else {
        element.remove();
    }
}

function setCampaignValuesOnPage(campaign) {
    // Avidtrak script will replace 
    avid_phone_replace = campaign.phone;
    //Existing Code-----------------------------------------------------------------------------------
    //Date : 11-06-2015
    //Comments : displaying the Avidtrak Id on the UI while rendering
    if (replacePhoneWithAvidTrakId) {
        $('.tel').each(function () {
            $(this).text(avid_phone_replace);
            $(this).attr('href', 'tel:' + avid_phone_replace);
        });
        $('.dyn-tel').each(function () {
            $(this).text(avid_phone_replace);
            $(this).closest('a').attr('href', 'tel:' + avid_phone_replace);
        });
        $('.telNoText').each(function () { $(this).attr('href', "tel:" + avid_phone_replace); });
    }
    
    if (campaign.useavidtrak) {
        //insertInvocaTrackScript();

        insertAvidTrakScript(avid_phone_replace);
    }
    else {
        //insertInvocaTrackScript();
       insertFallBackScript();
    }

    // Update all campaign related style classes
    $('.pcOffer').each(function () { replaceCampaignValueIfAvailable(campaign.pcOffer, $(this)); });
    $('.tcOffer').each(function () { replaceCampaignValueIfAvailable(campaign.tcOffer, $(this)); });
    $('.pcDisclaimer').each(function () { replaceCampaignValueIfAvailable(campaign.pcDisclaimer, $(this)); });
    $('.tcDisclaimer').each(function () { replaceCampaignValueIfAvailable(campaign.tcDisclaimer, $(this)); });

    setLegacyCampaignValuesOnPage(campaign);

    $('.externalLink').each(function () {
        $(this).attr('href', UpdateQueryString("adid", campaign.adid, $(this).attr('href')));
    });

    // Use above as desired approach because of orkin.com conflics with mainNav selector. 
    // Need to update all landing page links to orkin.com
    // to contain the .externalLink style class. See case 
    // https://rollins.fogbugz.com/default.asp?14994
    if (window.location.hostname.indexOf('signup') != -1) {
        $('#mainNav a').each(function () {
            $(this).attr('href', UpdateQueryString("adid", campaign.adid, $(this).attr('href')));
        });
    }

    // Update the hidden field used to pass the adid to the server upon submit
    $('#PromoCodeHiddenField, input[name="OriginalCodeHiddenField"], #PromoCodeHiddenField2').val(campaign.adid);

    //check if the phone number is 1-888-ORKINMAN for each class
    $('.tel').each(function () {
        if ($(this).text() == '1-888-ORKINMAN') {
            $(this).text(defaultPhonNumber);
            $(this).attr('href', 'tel:' + defaultPhonNumber);
        }
    });
    $('.dyn-tel').each(function () {
        if ($(this).text() == '1-888-ORKINMAN') {
            $(this).text(defaultPhonNumber);
            $(this).closest('a').attr('href', 'tel:' + defaultPhonNumber);
        }
    });
    $('.telNoText').each(function () {
        if ($(this).text() == '1-888-ORKINMAN') {
            $(this).attr('href', "tel:" + defaultPhonNumber);
        }
    });
}

function setAdidInStorage(adid) {
    localStorage.setItem(adidKey, adid);
}

(function ($) {
    $.fn.injectCampaignInfo = function (defaults) {
        defaultadid = defaults.defaultadid;
        invalidadid = defaults.invalidadid;

        var adid = getAdid();
        setCampaignValuesFromApi(adid);
        //insertInvocaTrackScript();
    };
})(jQuery);

