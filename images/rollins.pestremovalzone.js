
$(function () {
    $('body').injectCampaignInfo({
        'defaultadid': 'GDSWEB',
        'invalidadid': 'GDSWEB'
    });
})

$(document).ready(function () {
    $('#orkin_form').submit(function (event) {
        
        var leadObject = {'LeadRuleId': $('#LeadRule').val(),
            'CrmId': '0',
            'LeadReferrerData': document.location.href,
            'MarketingCampaignId': $('#PromoCodeHiddenField').val(),
            'MarketingSource': '',
            'MarketingMedium': '',
            'MarketingContent': '',
            'LeadOriginationData': event.ip,
            'LeadWantsSolicitations': false,
            'LeadCompanyName': null,
            'LeadIndustryName': null,
            'LeadAddress1': 'Not Updated',
            'LeadAddress2': null,
            'LeadCity': 'Not Upated',
            'LeadStateOrProvince': 'Not Updated',
            'LeadPostalCode': $('#zipCodeTextBox').val(),
            'LeadAddressIsOwned': false,
            'LeadEmailAddress': $('#emailAddressTextBox').val(),
            'LeadPrimaryPhone': $('#phone1TextBox').val(),
            'LeadSecondaryPhone': null,
            'LeadPreferredContactMethod': null,
            'LeadFirstName': $('#firstNameTextBox').val(),
            'LeadLastName': $('#lastNameTextBox').val(),
            'LeadJobTitle': null,
            'LeadComments': '',
            'IsWebLead': 1,
            'GoogleAWClickID': null,
            'GoogleAdClientID': null,
            'ServiceGroupId': 'RES',
            'ServiceLinesCsv': $('#ServiceLine_').val(),
            'PestsCsv': ''};

        ProcessLead(JSON.stringify(leadObject));
        event.preventDefault();
    });
});

function ProcessLead(lead)
{
    var url = "https://api.rollins.com/webservices/v1/orkinleadprocessservice.svc";
    $.ajax({
        type: 'POST',
        url: url + '/api/leads',
        data: lead,
        dataType: 'JSON',
        contentType: 'application/json',
        encode: true,
        success: function (data) {
            window.location = "/thank-you.html";
        },
        error:
            function (response) {
                alert("Error: " + response);
            }

    }).done(function (data) {
        console.log(data);
    });
}