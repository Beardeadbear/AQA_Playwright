const globals = require('../../globals_path');
const casual = require('casual');
const data = ['Test data first cell', 'Test data second cell'];
const newNames = ['Edited column 1', 'Edited column 2'];

module.exports = {
  before: function (browser, done) {
    browser.globals.dataSourceNameGenerated = `${casual.title} 03-edit`;

    browser
      .getNamesOfAppsAndDataSources([browser.globals.dataSourceNameGenerated], done, browser.globals.emailForOrganizationTests)
      .login(browser.globals.emailForOrganizationTests);
  },

  afterEach: function(browser, done){
    browser.getBrowserConsoleLogs(done);
  },

  after: function(browser){
    browser.end();
  },

  'Editing data source - add a new entry': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const allDataSources = browser.page.allDataSourcesPage();
    const lineNumber = 2;

    browser.createDataSource(browser.globals.dataSourceNameGenerated);

    //adding a new empty entry under existing one and adding some data to it

    dataSource
      .insertRowAfterSelectedOne(lineNumber)
      .changeValuesInDataSourceCells((lineNumber+1), data);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //checking that new data is saved in a line

    dataSource.assertCellsInLineContainSpecifiedValues((lineNumber+1), data);

    //adding a new empty row above existing one and adding some data to it

    dataSource
      .insertRowBeforeSelectedOne(lineNumber)
      .changeValuesInDataSourceCells(lineNumber,  data);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //checking that new data is saved in a row

    dataSource.clickBackToDataSourcesButton();

    browser.refresh()
      .switchToWidgetProviderFrame();

    allDataSources.waitForDataSourcesPageToBeLoaded();
    allDataSources.clickDataSourceByName(browser.globals.dataSourceNameGenerated);

    dataSource.assertCorrectDataSourceIsOpenedByName(browser.globals.dataSourceNameGenerated);
    dataSource.assertCellsInLineContainSpecifiedValues(lineNumber, data);
  },

  'Editing data source - edit existing entries': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const cellToCopyFrom = [2,1];
    const cellToCopyTo = [2,2];
    const cellToCutFrom = [4,2];
    const cellToPasteTo = [3,1];

    //copy data from one cell into another

    dataSource.copyValueFromOneCellOntoAnother(cellToCopyFrom,cellToCopyTo);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //checking that text was successfully copied

    dataSource.assertTextInSecondCellIsTheSameAsInFirstCell(cellToCopyFrom,cellToCopyTo);

    //cutting text in one cell and pasting it into another

    dataSource.cutTextFromOneCellToPasteInAnother(cellToCutFrom,cellToPasteTo);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //check that cell from where text was cut is empty

    browser
      .useXpath()
      .assert
      .containsText(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${cellToCutFrom[0]}]/td[${cellToCutFrom[1]}]`, '');

    //check that text was pasted to cell

    browser
      .expect.element(`//div[@id="hot"]//div[@class="wtSpreader"]//tbody/tr[${cellToPasteTo[0]}]/td[${cellToPasteTo[1]}]`)
      .text.to.equal(data[1]);

    browser.useCss();
  },

  'Editing data source - deleting an existing entry': function(browser){
    const dataSource = browser.page.singleDataSourcePage();
    const entries = [];

    //collecting all the text data in rows of data source

    dataSource.getTextOfDataSourceEntries(entries, 4);

    //deleting all entries except the last one

    dataSource.removeAllEntriesInDataSourceExceptLast(entries);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //asserting that remaining entry (first entry in list) is the entry that was last in list

     browser
      .waitForElementVisible('#hot .wtSpreader tbody tr:nth-child(2) td:first-of-type div', browser.globals.smallWait, ()=> {
       browser.assert.containsText('#hot .wtSpreader tbody tr:nth-child(2) td:first-of-type div', entries[entries.length - 1]);
      });
  },

  'Editing data source - adding a column': function(browser){
    const dataSource = browser.page.singleDataSourcePage();

    dataSource.addColumnBeforeSelectedOne(1);
    dataSource.addColumnAfterSelectedOne(1);
    dataSource.clickSaveChangesButtonOnEntriesScreen();
    dataSource.assertColumnHasSpecifiedName(1, 'Column 1');
    dataSource.assertColumnHasSpecifiedName(2, 'Column 2');
  },

  'Editing data source - editing a column name': function(browser){
    const dataSource = browser.page.singleDataSourcePage();

    dataSource.changeDataSourceColumnNames(newNames);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    // assert first two columns have new names

    dataSource.assertDataSourceColumnNamesAreCorrect(newNames);
  },

  'Editing data source - delete columns': function (browser) {
    const dataSource = browser.page.singleDataSourcePage();

    dataSource.removeColumnsByNames(newNames);
    dataSource.clickSaveChangesButtonOnEntriesScreen();

    //assert there are no columns with defined names

    dataSource.assertColumnsWithDefinedNamesAreNotPresent(newNames);
  },

  'Deleting created data sources': function(browser){
    browser
      .deleteDataSourcesMatchingParticularName(browser.globals.dataSourceNameGenerated)
      .removeNamesFromCleanersList([browser.globals.dataSourceNameGenerated], browser.globals.emailForOrganizationTests);
  }
};