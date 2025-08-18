const commands = {
  configureRssFeedView: function(rssLayoutOption){
    const rssLayoutTitleLocator =`//span[@class='help-block'][text()='${rssLayoutOption}']`;

    return this
      .assertAmountOfElementsVisible('@rssLayoutBlock',3)
      .api.useXpath()
      .click(rssLayoutTitleLocator)
      .waitForElementNotVisible(rssLayoutTitleLocator, this.api.globals.mediumWait)
      .useCss();
  },

  setRssFeedUrl: function(rssFeedUrl){

    return this
      .assert.attributeContains('#rss-settings-control', 'class', 'active')
      .waitForElementVisible('@rssFeedUrlInputField',this.api.globals.smallWait)
      .clearValue('@rssFeedUrlInputField')
      .setValue('@rssFeedUrlInputField', rssFeedUrl)
  },

  checkRssFeedContentSetting: function(rssFeedContentStatus){
    return this
      .waitForElementVisible('@rssFeedSettingContent', this.api.globals.longWait)
      .api.expect.element('#rss-feed-settings').to.have.attribute('class')
      .which.contains(rssFeedContentStatus).before(this.api.globals.longWait)
  },

  checkIncorrectRssFeedUrl: function(invalidUrlMessage){
    return this
      .waitForElementVisible('@incorrectRssFeedUrl', this.api.globals.longWait)
      .api.expect.element('.rss-fail strong').text.to.contain(invalidUrlMessage);
  },

  choseElementDisplayingSetting: function(element ,displayElementValue){
    return this
      .selectValueFromDropdownByText(`${element}-clipping`, displayElementValue)
  },

  designRssFeedEntriesView: function(entriesDesignType) {
    const entriesSeparatingTypeLocator =`//*[text()=' ${entriesDesignType}']/ancestor::label/parent::div`;

    this
      .api.useXpath()
      .waitForElementVisible(entriesSeparatingTypeLocator, this.api.globals.tinyWait)
      .click(entriesSeparatingTypeLocator)
      .expect.element(entriesSeparatingTypeLocator+`/input`).to.be.selected.before(this.api.globals.tinyWait);

    return this.api.useCss();
  },
};

module.exports = {
  commands: [commands],
  elements: {
    rssLayoutBlock: {
      selector: '.col-xs-6.layout-holder'
    },
    rssFeedUrlInputField: {
      selector: '#rss-feed-url'
    },
    rssFeedSettingContent: {
      selector: '#rss-feed-settings'
    },
    incorrectRssFeedUrl: {
      selector: '.rss-fail strong'
    }
  }
};
