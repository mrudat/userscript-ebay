// ==UserScript==
// @name          eBay - Display Totals with Shipping
// @namespace     http://www.facebook.com/Tophness
// @description   Computes and displays the total price with shipping added.
// @include       http://*.ebay.tld/*sch/*
// @include       http://*.ebay.tld/*i.html?*
// @include       http://*.ebay.tld/itm/*
// @version       0.0.2.20140928141320
// ==/UserScript==

/* jshint esnext: true */

process();

function process() {
    var currency = '$';
    var price = /\$([\d\,]*\.\d\d)/; // regexp to test for currency
    var tld = location.host.split('.').reverse()[0];
    switch (tld) {
        case 'uk':
            currency = '£';
            price = /£([\d\,]*.\d\d)/;
            break;
    }

    var itemPage = /^\/itm\//.test(location.pathname);

    if (itemPage) {
        var buyItNowPrice = -1;
        var shippingPrice = -1;

        //TODO display table of total price for 1 .. min(10,available) of item (presuming shipping cost differs)
        //FIXME only possible if we can work out conversion rate for extra shipping; possibly not worthwhile?
        //var priceTableTarget = document.querySelector('div.quantity').parentNode;
        //var shippingTable = document.querySelector('table.sh-tbl');
        
        var priceSummary = document.querySelector('span#prcIsum');
        var priceSummaryConverted = document.querySelector('span#convbinPrice');
        var priceSummaryConvertedContainer = document.querySelector('span#prcIsumConv');

        var priceSummaryText = null;
        if (priceSummaryConverted !== null) {
            priceSummaryText = priceSummaryConverted.textContent;
            priceSummaryConverted.parentNode;
        } else if (priceSummary !== null) {
            priceSummaryText = priceSummary.textContent;
        }
        var priceSummaryCurrency = "";
        if (priceSummaryText !== null) {
            priceSummaryCurrency = priceSummaryText.substring(0, priceSummaryText.indexOf(currency) + 1);
            buyItNowPrice = priceSummaryText.match(price)[1].replace(',','');
        }
        
        var shippingCost = document.querySelector('span#fshippingCost');
        var shippingCostConverted = document.querySelector('span#convetedPriceId');

        var shippingCostText = null;
        if (shippingCostConverted !== null) {
            shippingCostText = shippingCostConverted.textContent;
        } else if (shippingCost != null) {
            shippingCostText = shippingCost.textContent;
        }
        if (shippingCostText !== null) {
            if (/Free/.test (shippingCostText) || (/Digital delivery/.test(shippingCostText))) {
                shippingPrice = 0;
            } else if (/Not specified/.test(shippingCostText)) {
                shippingPrice = '?';
            } else if (price.test(shippingCostText)){
                shippingPrice = shippingCostText.match(price)[1].replace(',','');
            }
        }

        if (buyItNowPrice != -1 && shippingPrice != -1) {
            var buyItNowTotal = "?";
            if (!isNaN(buyItNowPrice) && !isNaN(shippingPrice)){
                buyItNowTotal = (parseFloat(buyItNowPrice) + parseFloat(shippingPrice)).toFixed(2);
            }
            if (priceSummaryConverted !== null){
                priceSummaryConverted.parentNode.parentNode.removeChild(priceSummaryConverted.parentNode);
            }
            priceSummary.innerHTML = priceSummaryCurrency + buyItNowTotal;
            shippingCost.innerHTML = priceSummaryCurrency + buyItNowPrice + ' + <span class="sh-svc sh-nwr">' + priceSummaryCurrency + shippingPrice + '</span>';
        }
    } else {
        Array.prototype.forEach.call(document.querySelectorAll('li[listingid]'),rowElement => {
            var buyItNowPrice = -1;
            var shippingPrice = -1;

            var lvprices = rowElement.querySelector('ul.lvprices');

            // TODO what is this for?
            Array.prototype.forEach.call(lvprices.querySelectorAll('div.cmpat'),i => i.parentNode.removeChild(i));

            var shipping = lvprices.querySelector('span.fee');

            if (shipping !== null) {
                var tc = shipping.textContent;
                if (/Free/.test (tc) || (/Digital delivery/.test(tc))) {
                    shippingPrice = 0;
                } else if (/Not specified/.test(tc)) {
                    shippingPrice = '?';
                } else if (price.test(tc)){
                    shippingPrice = tc.match(price)[1].replace(',','');
                }
            }

            var buyItNow = lvprices.querySelector('li.lvprice span.bold') || lvprices.querySelector('li.lvprice');

            if (buyItNow !== null) {
                var tc = buyItNow.textContent;
                buyItNowPrice = tc.match(price)[1].replace(',','');
            }

            if (buyItNowPrice != -1 && shippingPrice != -1) {
                var buyItNowTotal = "?";
                if (!isNaN(buyItNowPrice) && !isNaN(shippingPrice)){
                    buyItNowTotal = (parseFloat(buyItNowPrice) + parseFloat(shippingPrice)).toFixed(2);
                }
                buyItNow.innerHTML = buyItNow.innerHTML.substring(0, buyItNow.innerHTML.indexOf('</b>') + 4) + buyItNowTotal;
                shipping.innerHTML = '<b>' + currency + buyItNowPrice + '</b> + ' + shipping.innerHTML.substring(shipping.innerHTML.indexOf(currency));
            }
        });
    }
}
