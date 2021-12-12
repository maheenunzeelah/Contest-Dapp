
window.web3 = new Web3(window.ethereum);
window.ethereum.enable();
App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: async function () {
    await App.initWeb3()
    await App.loadAccount()
    await App.initContract()
    await App.render()


  },

  initWeb3: async function () {
    if (typeof web3 != undefined) {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider)
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
  },
  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
  },
  initContract: async function () {
    const contestJSON = await $.getJSON("Contests.json");
    App.contracts.Contests = TruffleContract(contestJSON);
    App.contracts.Contests.setProvider(App.web3Provider);

    // Hydrate the smart contract with values from the blockchain
    App.contest = await App.contracts.Contests.deployed()

  },
  listenForEvents: async function () {
    const votedEvent = await App.contest.votedEvent({}, {
      fromBlock: 0,
      toBlock: 'latest'
    });
    votedEvent.watch(function (err, event) {
      App.render()
    })

  },
  render: async function () {
    if (App.loading) {
      return
    }
    App.setLoading(true)

    // Render Account
    $("#accountAddress").html("Your Account:" + App.account);

    // Render Tasks
    await App.renderContests();
    console.log(App.loading, "loadddd")
    // Update loading state
    App.setLoading(false);




  },
  renderContests: async function () {

    const contestantsCount = await App.contest.contestantCount();
    console.log(contestantsCount)
    var contestantsResults = $("#contestantsResults");
    contestantsResults.empty();

    var contestantsSelect = $("#contestantsSelect");
    contestantsSelect.empty();
    for (var i = 1; i <= contestantsCount; i++) {
      const contestant = await App.contest.contestant(i);

      const id = contestant[0];
      const name = contestant[1];
      const voteCount = contestant[2];

      var contestantTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
      contestantsResults.append(contestantTemplate);

      var contestantOption = "<option value='" + id + "'>" + name + "</option>"
      contestantsSelect.append(contestantOption);

    }

  },

  // bindEvents: function () {
  //   $(document).on('click', '.btn-adopt', App.handleAdopt);
  // },

  castVote: async function () {
    App.setLoading(true)
    const contestantId = $('#contestantsSelect').val();
    try {
      await App.contest.vote(contestantId, { from: App.account })
    }
    catch (err) {
      App.setLoading(false)
    }

    window.location.reload();

  },
  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },


};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
