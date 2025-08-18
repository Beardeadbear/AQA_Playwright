const casual = require('casual');
const globals = require('../../globals_path');
const values = require('../../utils/constants/values');
const webAppUrl = 'https://staging-apps.fliplet.com/qa-complex-app-complex-test-app-30-initial';
const appName = 'Complex test app 3.0';
const userInfo = ['A'.concat(casual.first_name).toUpperCase(), 'A'.concat(casual.last_name).toUpperCase(), globals.userEmail,
    casual.phone.replace(new RegExp('-', 'g'), ''), casual.password];
const fileName = 'icon.png';
const totalNumberOfChartEntries = [];

module.exports = {
    before: function (browser) {
        browser.url(webAppUrl);
    },

    afterEach: function (browser, done) {
        browser.getBrowserConsoleLogs(done);
    },

    after: function (browser) {
        browser.end();
    },

    'Check Intro - onboarding screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkPageTitle(`Intro - ${appName}`)
            .checkOnboardingScreen(3, 1)
            .checkOnboardingSlidesFunctionality()
            .checkSkipButton();
    },

    'Check that it is not possible to open the app screens without login': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Menu')
            .checkPageTitle(`Log in - ${appName}`);
    },

    'Check "Login error" message with incorrect credentials': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkForgotPassword()
            .enterEmailAndPasswordForLogin((casual.letter).concat(userInfo[2]), userInfo[4])
            .submitLoginForm()
            .assertErrorLoginMessageIsDisplayed('The email address could not be found.');
    },

    'Check "Sign up" error messages because of empty required fields': function (browser) {
        const webApp = browser.page.webApplicationPages();
        const formBuilderPage = browser.page.formBuilderPage();

        webApp.clickSingUpButton()
            .checkPageTitle(`Sign up - ${appName}`);

        formBuilderPage.enterInvalidDataAndCheckIt('Email', values.EMPTY_STRING, 'Field is required.');
    },

    'Check "Sign up" error messages because of email invalid value': function (browser) {
        const formBuilderPage = browser.page.formBuilderPage();

        formBuilderPage.enterInvalidDataAndCheckIt('Email', userInfo[2].replace('@', values.EMPTY_STRING),
            'The input is not a valid email address.');
    },

    'Check "Sign up" form submission with valid values': function (browser) {
        const formBuilderPage = browser.page.formBuilderPage();

        formBuilderPage.enterValuesIntoForm([userInfo[2], userInfo[4]])
            .clickSubmitFormButton()
            .assertThatFormHasBeenSuccessfullySubmitted('You can login now.');
    },

    'Check "Login error" message because of an incorrect password': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.clickElementOnWebAppScreen('@secondaryButton')
            .enterEmailAndPasswordForLogin(userInfo[2], userInfo[4].toUpperCase())
            .submitLoginForm()
            .assertErrorLoginMessageIsDisplayed("Your email or password don't match. Please try again.");
    },

    'Check login with correct credentials': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.enterEmailAndPasswordForLogin(userInfo[2], userInfo[4])
            .submitLoginForm()
            .assertLoginIsSuccessful();
    },

    'Check List (no images) screen ': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkPageTitle(`Menu - ${appName}`)
            .checkListScreen(8)
            .clickListItem('Our People')
            .checkPageTitle(`Our People - ${appName}`);
    },

    'Check Chart screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkTitleOnScreen('Our People')
            .checkChartScreen(4)
            .checkChartColumnsFunctionality()
            .getTotalNumberOFChartEntries(totalNumberOfChartEntries);
    },

    'Check Accordion screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Edit your profile')
            .checkPageTitle(`Edit your profile - ${appName}`)
            .checkTitleOnScreen('Edit your profile')
            .checkAccordionHeadingExpanding()
            .checkAccordionHeadingCollapsing();
    },

    'Check Form screen with invalid values': function (browser) {
        const webApp = browser.page.webApplicationPages();
        const formBuilderPage = browser.page.formBuilderPage();

        webApp.checkPageTitle(`Edit your profile - ${appName}`)
            .checkAccordionHeadingExpanding();

        formBuilderPage.enterInvalidDataAndCheckIt('Email', userInfo[2].replace('@', ''),
            'The input is not a valid email address.')
            .enterInvalidDataAndCheckIt('Number', userInfo[3].concat(casual.word),
                'Phone could contain ; , . ( ) - + SPACE * # and numbers.');
        formBuilderPage.getRandomValueForMultipleOptionsFormField('Department', userInfo);
        formBuilderPage.getRandomValueForMultipleOptionsFormField('Location', userInfo)
        formBuilderPage.clickClearFormButton();
        webApp.checkPageTitle(`Edit your profile - ${appName}`)
            .checkAccordionHeadingExpanding();
    },

    'Check Form screen with valid values': function (browser) {
        const formBuilderPage = browser.page.formBuilderPage();

        formBuilderPage.enterValuesIntoForm(userInfo.slice(0, -2))
            .selectValueFromFormDropdown('Department', userInfo[5])
            .chooseRadioInForm('Location', userInfo[6]);
    },

    'Upload an image to the form and submit': function (browser) {
        const formBuilderPage = browser.page.formBuilderPage();

        formBuilderPage.clickChooseImageForForm()
            .selectAnImageForUploading(fileName)
            .clickSubmitFormButton();
    },

    'Check Small Cards LFD screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkPageTitle(`Our People - ${appName}`)
            .checkSmallCardLfd(userInfo[0].concat(' ', userInfo[1]))
            .openAndCheckLfdItemDetails()
            .closeLfdItemDetailsOverlay();
    },

    'Check Chart entries after form submission': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkTitleOnScreen('Our People')
            .checkChartScreen(4)
            .checkChartColumnsFunctionality()
            .checkChartDatSourceProvider(totalNumberOfChartEntries[0]);
    },

    'Check Chat screen': function (browser) {//TODO: chat test
        const webApp = browser.page.webApplicationPages();
        const chatScreen = browser.page.chatScreen();

        webApp.openWebAppMenu()
            .openMenuItemByName('Chat')
            .checkPageTitle(`Chat - ${appName}`)
            .checkTitleOnScreen('Chat')
            .allowNotificationOnPopup();

        chatScreen.checkChatDetails()
            .openChooseContactsListOverlay()
            .closeContactsListOverlay();
    },

    'Check Simple List LFD screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Our News')
            .checkPageTitle(`Our News - ${appName}`)
            .checkTitleOnScreen('Our News')
            .openAndCheckLfdItemDetailsOurNews()
            .closeLfdItemDetailsOverlay();
    },

    'Check Simple List LFD bookmark functionality': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkBookmarkedLfdItem()
            .checkBookmarkFunctionality(2)
            .openAndCheckLfdBookmarkedItemDetails()
            .removeBookmarkFromLfdItem()
            .closeLfdItemDetailsOverlay()
            .checkIfBookmarkIsNotSelected();
    },

    'Check Simple List LFD search, filter and like functionality': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkLfdFilterFunctionality()
            .checkLfdFilterFunctionality() //to ensure bug https://weboo.atlassian.net/browse/OD-80?focusedCommentId=10582 is not reproduced
            .checkLfdLikeFunctionality(2)
            .checkLfdSearchFunctionality(3);
    },

    'Check Agenda LFD Screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Eating schedule')
            .checkPageTitle(`Eating schedule - ${appName}`)
            .checkTitleOnScreen('Eating schedule')
            .openAndCheckLfdEatingSchedule()
            .closeLfdItemDetailsOverlay();
    },

    'Check Agenda LFD bookmark functionality': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkBookmarkedLfdItem()
            .checkBookmarkFunctionality(2)
            .openAndCheckLfdEatingScheduleBookmark()
            .removeBookmarkFromLfdItem()
            .closeLfdItemDetailsOverlay()
            .checkIfBookmarkIsNotSelected();
    },

    'Check Agenda LFD search, filter and switching between days functionality': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.checkLfdFilterFunctionality()
            .checkLfdFilterFunctionality() //to ensure bug https://weboo.atlassian.net/browse/OD-80?focusedCommentId=10582 is not reproduced
            .checkLfdSearchFunctionality(2)
            .checkAgendaLfdDaysFunctionality();
    },

    'Check Interactive Graphics Screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Interactive Map')
            .checkPageTitle(`Interactive Map - ${appName}`)
            .checkTitleOnScreen('Interactive Map')
            .checkInteractiveGraphicsMaps(1)
            .checkInteractiveGraphicsMarkers(4);
    },

    'Check List (with panels) screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Playroom')
            .checkPageTitle(`Playroom - ${appName}`)
            .checkTitleOnScreen('Playroom')
            .checkListWithPanels(2)
            .clickPanelByNumber(1)
            .checkOfflineVideo();
    },

    'Check Metro with panels screen': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('Actions')
            .checkPageTitle(`Actions - ${appName}`)
            .checkTitleOnScreen('Actions')
            .checkMetroComponent(4)
            .clickPanelByNumber(2)
            .checkOfflineVideo()
            .clickPanelByNumber(4)
            .checkAboutThisAppOverlay()
            .closeAboutThisAppOverlay();
    },

    'Check About this app screen with secondary button': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.openWebAppMenu()
            .openMenuItemByName('About Us')
            .checkPageTitle(`About Us - ${appName}`)
            .checkTitleOnScreen('About Us')
            .clickElementOnWebAppScreen('@secondaryButton')
            .checkPageTitle(`Menu - ${appName}`);
    },

    'Check About this app screen with inline link': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.clickListItem('About Us')
            .checkPageTitle(`About Us - ${appName}`)
            .clickElementOnWebAppScreen('@inlineLink')
            .switchToNewWindow('@inlineLink', 'https://fliplet.com/')
            .checkPageTitle('Fliplet');
    },

    'Check Small Cards LFD entry management - item deleting': function (browser) {
        const webApp = browser.page.webApplicationPages();

        webApp.switchToOpenWindowByNumber(1)
            .checkPageTitle(`About Us - ${appName}`)
            .openWebAppMenu()
            .openMenuItemByName('Our People')
            .checkPageTitle(`Our People - ${appName}`)
            .openLfdItemDetailsByTitle(`${userInfo[0]} ${userInfo[1]}`)
            .clickDeleteButtonOnLfdItemDetailedView()
            .confirmLfdItemDeleting()
            .checkChartDatSourceProvider(totalNumberOfChartEntries);
    }
};