(function ($, sr, undefined) {
"use strict";

var canStore = typeof(Storage) !== 'undefined';
var localCurrency = 'USD';
var listLoaded = false;
var selectedCoin = '';
var savedCoin = canStore && localStorage.getItem('sellCoin') ? localStorage.getItem('sellCoin') : '';
var coins = [];
var currencies = [];
var compareCoins = canStore && localStorage.getItem('CompareCoins') ?
  (localStorage.getItem('CompareCoins') || 'BTC,ETH').split(',') : ['BTC', 'ETH'];

// setup local currency swap
$('.exchange-currency-local').select2({
  data: [{
    id: 'USD',
    text: 'US Dollar'
  }, {
    id: 'EUR',
    text: 'Euro'
  }, {
    id: 'GBP',
    text: 'British Pound'
  }],
  minimumResultsForSearch: Infinity
});
$('.exchange-currency-local').on('change', function () {
  if (localCurrency !== $(this).val()) {
    localCurrency = $(this).val();
    refresh();
  }
});

// initialize with list of all coins
$.getJSON('https://www.cryptocompare.com/api/data/coinlist/',
  function (res) {
    coins = Object.values(res.Data).map(function (c) {
      return {
        id: c.Name,
        imageUrl: c.ImageUrl,
        text: c.CoinName,
        order: parseInt(c.SortOrder)
      };
    });
    coins = coins.sort(function (a, b) { return a.order - b.order; });
    currencies = currencies.concat(coins);
    selectedCoin = coins[0].id;
    $('.exchange-input-image').css('background-image', 'url(https://www.cryptocompare.com' + coins[0].imageUrl + ')');

    $('.exchange-currency-source').select2({
      data: coins
    });
    if (savedCoin) {
      $('.exchange-currency-source').val(savedCoin).change();
    }

    $('.exchange-currency-types').select2({
      data: currencies
    });
    $('.exchange-currency-types').val(compareCoins).change();

    $('#loading-content, #loaded-content').addClass('loaded');
  }
);

$('.exchange-currency-source').on('change', function () {
  selectedCoin = savedCoin || $(this).val();
  savedCoin = null;

  localStorage.setItem('sellCoin', selectedCoin);
  var img = coins.filter(function (c) { return c.id === selectedCoin; })[0].imageUrl;
  $('.exchange-input-image').css('background-image', 'url(https://www.cryptocompare.com' + img + ')');
  refresh();
});

$('.exchange-currency-types').on('change', function () {
  refresh();
});

$('.exchange-refresh-button').on('click', refresh);

function refresh () {
  localStorage.setItem('CompareCoins', $('.exchange-currency-types').val());
  var convertTo = [localCurrency].concat($('.exchange-currency-types').val());
  $.getJSON('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + selectedCoin + '&tsyms=' + convertTo.join(','),
    function (res) {
      var matches = res.DISPLAY[selectedCoin];
      // transform price into something parsable
      Object.values(matches).forEach(function (data) {
        data.priceFloat = parseFloat(data.PRICE.replace(/[^\d.-]/g, ''));
      });
      matches[localCurrency].buyingPower = (matches[localCurrency].priceFloat).toFixed(6) * (parseInt($('.exchange-currency-amount').val()) || 1);
      matches[localCurrency].localRate = 1;
      matches[localCurrency].symbol = localCurrency;
      $.getJSON('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + localCurrency + '&tsyms=' + Object.keys(matches).join(','),
        function (res2) {
          if (res2.Response && res2.Response === 'Error') {
            return;
          }
          // buying power: how much can 1000 usd buy
          var conversions = res2[localCurrency];
          Object.keys(conversions).forEach(function (sym) {
            // conversions[sym] -> how much sym you can buy for 1 USD
            // matches[sym].priceFloat -> how much sym you can buy for 1 of selected coin
            matches[sym].buyingPower = ((1 / conversions[sym]) * matches[sym].priceFloat).toFixed(6) * (parseInt($('.exchange-currency-amount').val()) || 1);
            matches[sym].localRate = conversions[sym];
            matches[sym].symbol = sym;
          });

          // get best buying power
          var best = Object.values(matches).sort(function (a, b) { return parseFloat(b.buyingPower) - parseFloat(a.buyingPower); })[0];
          matches[best.symbol].best = true;

          var render = '';
          // render
          Object.keys(matches).forEach(function (sym) {
            var coinImage = '';

            if (sym !== localCurrency) {
              var coinImage = coins.filter(function (c) { return c.id === sym; })[0].imageUrl;
              coinImage = "<img class='exchange-result-thumbnail' src='https://www.cryptocompare.com" + coinImage + "' />";
            } else {
              coinImage = "<div class='exchange-result-thumbnail'><span class='fa fa-" + localCurrency.toLowerCase() + "'></span></div>";
            }

            var h = "<div class='exchange-result " + (matches[sym].best ? "best" : "") + "'>" +
              "<div class='exchange-result-header'>" + coinImage +
              ($('.exchange-currency-amount').val() || 1) + " " + selectedCoin + " converted to " + sym + " is worth" +
              "<h3 class='exchange-result-title'>" +
              matches[sym].buyingPower.toFixed(4) + " " + localCurrency +
              "</h3>" +
              "1 " + selectedCoin + " costs <strong>" + matches[sym].priceFloat + " " + sym + "</strong>" +
              "<small>(1 " + sym + " = <strong>" + (1/matches[sym].localRate).toFixed(6) + " " + localCurrency + "</strong>)</small>" +
              "</div>" +
              "<div class='exchange-result-stats'>" +
              "<div class='row'><div><div class='arrow-up'></div>24h High</div><div><strong>" + matches[sym].HIGH24HOUR +"</strong></div></div>" +
              "<div class='row'><div><div class='arrow-down'></div>24h Low</div><div><strong>" + matches[sym].LOW24HOUR + "</strong></div></div>" +
              "</div>" +
              "<div class='exchange-result-details'>" +
                "<div>Market: " + matches[sym].LASTMARKET + "</div>" +
                "<small>Updated " + matches[sym].LASTUPDATE.toLowerCase() + "</small>" +
              "</div></div>";
            render += h;
          });
          $('.exchange-output').html(render);
        }
      );
    }
  );
}

})(jQuery, 'smartresize');
