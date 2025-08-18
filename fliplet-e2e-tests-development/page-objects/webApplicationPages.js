const util = require('util');
const elementProperties = require('../utils/constants/elementProperties');
const notificationTitle = '//*[@class="notifications"]/div/h2[text()="%s"]';
const notificationMessage = '(//div[@class="notifications"]//div[@class="description"])[%d]';
const lfdItemTitleLocator = '//div[@class="small-h-card-list-item-text"][text()="%s"]';
const allowNotificationPopup = '(//div[starts-with(@class,"popup-screen")]//button[@data-allow])[%d]';

const commands = {
    checkPageTitle: function (pageTitle) {
        this
            .waitForElementVisible('body', this.api.globals.longWait)
            .api.getTitle((result) => {
            this.assert.ok(result.includes(pageTitle), `The page title ${pageTitle} is correct.`)
        });

        return this;
    },

    checkPageURl: function (pageUrl) {
        return this
            .waitForElementVisible('body', this.api.globals.longWait)
            .assert.urlContains(pageUrl, `The page URl ${pageUrl} is correct.`);
    },

    assertWidgetIsPresentOnScreen(component) {
        const widgetLocator = `[data-widget-package="${component}"]`;

        return this
            .waitForElementPresent(widgetLocator, this.api.globals.longWait)
            .assert.visible(widgetLocator, 'The widget is present on the screen.');
    },

    clickElementOnWebAppScreen: function (locator) {
        return this
            .waitForElementVisible(locator, this.api.globals.mediumWait)
            .click(locator);
    },

    openWebAppMenu: function () {
        this
            .waitForElementVisible('@burgerIcon', this.api.globals.mediumWait)
            .api.execute(function () {
            const burgerIcon = document.querySelector('.nav-right');
            burgerIcon.click();
        });

        return this
            .waitForElementVisible('@menu', this.api.globals.smallWait);
    },

    openMenuItemByName: function (name) {
        const menuItemLocator = `//li//span[text()="${name}"]`;
        const complexMenuLocator = `(//li//span[text()="${name}"])[2]`;

        this
            .api.useXpath()
            .elements('xpath', menuItemLocator, function (result) {
                if (result.value.length === 1) {
                    this.waitForElementVisible(menuItemLocator, this.globals.smallWait)
                        .click(menuItemLocator);
                } else {
                    this
                        .isVisible(complexMenuLocator, function (displaying) {
                            if (displaying.value === true) {
                                this.waitForElementVisible(complexMenuLocator, this.globals.smallWait)
                                this.click(complexMenuLocator);
                            } else {
                                this.waitForElementVisible(menuItemLocator, this.globals.smallWait)
                                    .click(menuItemLocator);
                            }
                        })
                }
            })
            .useCss()
            .pause(1500);

        return this;
    },

    checkTitleOnScreen: function (pageTitle) {
        return this
            .waitForElementVisible('@screenTitle', this.api.globals.smallWait)
            .assert.containsText('@screenTitle', pageTitle);
    },

    getCredentials: function (credentials) {
        const infoBlockLocator = '.column-item .info-block p';

        this
            .waitForElementVisible(infoBlockLocator, this.api.globals.smallWait)
            .getText(infoBlockLocator, (text) => credentials.push(text.value.toString().match(/Email: (.*)/)[1]))
            .getText(infoBlockLocator, (text) => credentials.push(text.value.toString().match(/Password: (.*)/)[1]));

        return credentials;
    },

    enterEmailAndPasswordForLogin: function (email, password) {
        return this
            .waitForElementVisible('@emailField', this.api.globals.smallWait)
            .clearValue('@emailField')
            .setValue('@emailField', email)
            .logTestInfo(`Email: ${email}`)
            .waitForElementVisible('@passwordField', this.api.globals.smallWait)
            .clearValue('@passwordField')
            .setValue('@passwordField', password)
            .logTestInfo(`Password: ${password}`);
    },

    enterEmailForLoginComponent: function (email) {
        return this
            .waitForElementVisible('@emailField', this.api.globals.smallWait)
            .clearValue('@emailField')
            .setValue('@emailField', email)
            .logTestInfo(`Email: ${email}`);
    },

    clickContinueForLoginComponent: function () {
        return this
            .waitForElementVisible('@continueButtonForLogin', this.api.globals.smallWait)
            .click('@continueButtonForLogin');
    },

    enterPasswordForLoginComponent: function (password) {
        return this
            .waitForElementVisible('@passwordField', this.api.globals.smallWait)
            .clearValue('@passwordField')
            .setValue('@passwordField', password)
            .logTestInfo(`Password: ${password}`);
    },

    assertLoginIsSuccessful: function () {
        return this
            .waitForElementNotPresent('@loginButton', this.api.globals.longWait)
            .waitForElementNotPresent('@emailField', this.api.globals.smallWait);
    },

    assertErrorLoginMessageIsDisplayed: function (errorMessage) {
        return this
            .waitForElementVisible('@loginErrorMessage', this.api.globals.mediumWait)
            .assert.containsText('@loginErrorMessage', errorMessage);
    },

    submitLoginForm: function () {
        this
            .waitForElementVisible('@loginButton', this.api.globals.smallWait)
            .api.pause(1000)
            .submitForm('.fl-login-form .form-horizontal, .login-form')
            .pause(1000)
            .element('css selector', '.fl-toast-body', function (result) {
                if (result.status === 0) {
                    this.execute(function () {
                        const loginButton = document.querySelector('.btn.btn-primary.btn-login');
                        loginButton.click();
                    });
                }
            })
            .pause(1000);

        return this;
    },

    checkOnboardingScreen: function (amountOfSlides, amountOfSlideWithImages) {
        return this
            .waitForElementVisible('@onboardingSlideContent', this.api.globals.smallWait)
            .assertAmountOfElementsVisible('.swiper-pagination-bullet', amountOfSlides)
            .assertAmountOfElementsPresent('.swiper-slide', amountOfSlides)
            .assertAmountOfElementsPresent('.swiper-slide img', amountOfSlideWithImages);
    },

    checkOnboardingSlidesFunctionality: function () {
        const previousSlideButtonLocator = '.swiper-button-prev';
        const nextSlideButtonLocator = '.swiper-button-next';

        return this
            .waitForElementVisible(nextSlideButtonLocator, this.api.globals.smallWait)
            .waitForElementNotVisible(previousSlideButtonLocator, this.api.globals.tinyWait)
            .click(nextSlideButtonLocator)
            .waitForElementVisible(previousSlideButtonLocator, this.api.globals.mediumWait)
            .assert.visible('@onboardingSlideContent');
    },

    checkSlideWithButton: function () {
        return this
            .waitForElementVisible('@activeSlideImage', this.api.globals.smallWait)
            .assert.visible('@activeSlideButton');
    },

    checkSkipButton: function () {
        return this
            .waitForElementVisible('@skipButton', this.api.globals.tinyWait)
            .click('@skipButton')
            .waitForElementNotPresent('@skipButton', this.api.globals.longWait);
    },

    checkListScreen: function (amountOfListItems) {
        const listHolderLocator = '.list-holder';

        return this
            .waitForElementVisible(listHolderLocator, this.api.globals.tinyWait)
            .assertAmountOfElementsVisible(listHolderLocator + ' li', amountOfListItems)
            .assertAmountOfElementsVisible(listHolderLocator + ' .list-icon', amountOfListItems)
    },

    checkListImages: function (amountOfListItems) {
        return this
            .assertAmountOfElementsVisible('.list-holder .list-image i', amountOfListItems);
    },

    clickListItem: function (listItemTitle) {
        const listItemHolderLocator = `//*[@class="list-holder "]//p[text()="${listItemTitle}"]`;

        this
            .api.useXpath()
            .waitForElementVisible(listItemHolderLocator, this.api.globals.smallWait)
            .click(listItemHolderLocator)
            .useCss();

        return this;
    },

    checkForgotPassword: function () {
        this
            .waitForElementPresent('@forgotPassword', this.api.globals.smallWait)
            .click('@forgotPassword')
            .waitForElementNotVisible('@forgotPassword', this.api.globals.smallWait)
            .waitForElementVisible('@resetPasswordEmailField', this.api.globals.smallWait)
            .waitForElementVisible('@backToLoginButton', this.api.globals.tinyWait)
            .api.element('css selector', '.btn.btn-link[class*=back]', function (result) {
            this
                .moveTo(result.value.ELEMENT)
                .mouseButtonClick();
        });

        return this
            .waitForElementNotVisible('@backToLoginButton', this.api.globals.smallWait)
            .waitForElementVisible('@forgotPassword', this.api.globals.smallWait);
    },

    checkMenuPanel: function () {
        const moreMenuPanelButtonLocator = '.fl-widget-instance :nth-child(1).fl-menu-body [data-show-more]';
        const menuItemIconLocator = '.fl-widget-instance :nth-child(1).fl-menu-body .fl-menu-icon';

        return this
            .waitForElementVisible('@menuPanel', this.api.globals.mediumWait)
            .waitForElementPresent(menuItemIconLocator, this.api.globals.mediumWait)
            .waitForElementVisible(moreMenuPanelButtonLocator, this.api.globals.smallWait)
            .click(moreMenuPanelButtonLocator)
            .assert.attributeContains('@menuPanel', 'class', 'expanded');
    },

    openScreenFromMenuPanelByName(screenName, appName, done) {
        const screenTitleOnMenuPanelLocator = `(//*[@class='fl-widget-instance']//div[@class = 'fl-menu-title']/span[text()='${screenName}'])[1]`;

        this
            .checkMenuPanel(() => {
                done()
            })
            .api.perform(() => {
            this.api
                .useXpath()
                .waitForElementVisible(screenTitleOnMenuPanelLocator, this.api.globals.longWait)
                .click(screenTitleOnMenuPanelLocator)
                .assert.cssProperty(screenTitleOnMenuPanelLocator, 'color', 'rgba(0, 171, 209, 1)')
                .useCss();
        });

        return this;
    },

    checkBookmarkFunctionality: function (numberOfListItemToBookmark) {
        const articleBookmarkLocator = `(//*[contains(@class,"btn-bookmark")])[${numberOfListItemToBookmark}]`;
        const bookmarkedListItemTitleLocator = '//*[contains(@class,"btn-bookmarked")]/ancestor::div[@class="news-feed-item-inner-content" ' +
            'or "list-item-body"]/*[contains(@class,"item-title")]';

        this
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
            .api.useXpath()
            .waitForElementVisible(articleBookmarkLocator, this.api.globals.smallWait)
            .click(articleBookmarkLocator)
            .waitForElementVisible(bookmarkedListItemTitleLocator, this.api.globals.mediumWait)
            .getText(bookmarkedListItemTitleLocator, (result) => {
                this
                    .waitForElementVisible('@toggleBookmarksIcon', this.api.globals.smallWait)
                    .click('@toggleBookmarksIcon')
                    .waitForElementVisible('@lfdItemTitle', this.api.globals.smallWait)
                    .assert.containsText('@lfdItemTitle', result.value);
            })
            .useCss();

        return this;
    },

    removeBookmarkFromLfdItem: function () {
        return this
            .waitForElementVisible('@lfdItemBookmarkedIconOnOverlay', this.api.globals.smallWait)
            .click('@lfdItemBookmarkedIconOnOverlay')
            .waitForElementNotPresent('@lfdItemBookmarkedIconOnOverlay', this.api.globals.smallWait)
    },

    checkLfdLikeFunctionality: function (numberOfListItemToLike) {
        const likeListItemLocator = '.btn-like';
        const likedListItemLocator = '.btn-liked';

        this
            .waitForElementVisible(likeListItemLocator, this.api.globals.smallWait)
            .api.elements('css selector', likeListItemLocator, function (result) {
            this.assertAmountOfElementsPresent(likeListItemLocator, result.value.length)
                .moveTo(result.value[numberOfListItemToLike | 0].ELEMENT)
                .mouseButtonClick(0, () => {
                    this.waitForElementVisible(likedListItemLocator)
                        .assertAmountOfElementsPresent(likeListItemLocator, result.value.length - 1)
                        .pause(2000)
                        .moveTo(likedListItemLocator)
                        .mouseButtonClick(0, () => {
                            this.waitForElementNotPresent(likedListItemLocator)
                                .assertAmountOfElementsPresent(likeListItemLocator, result.value.length);
                        });
                });
        });

        return this;
    },

    checkIfBookmarkIsNotSelected: function () {
        const myBookmarkLocator = '.toggle-bookmarks, .toggle-agenda';

        this
            .waitForElementVisible('@toggleBookmarksIcon', this.api.globals.smallWait)
            .waitForElementNotPresent('@bookmarkedIcon', this.api.globals.smallWait)
            .api.element('css selector', myBookmarkLocator, (result) => {
            this.api.elementIdAttribute(result.value.ELEMENT, 'class', (classValue) => {
                if (classValue.value.toString().includes('active')) {
                    this
                        .logTestInfo('My bookmarks icon is active. Let\'s click it.')
                        .api.elementIdClick(result.value.ELEMENT);
                }
            });
        });

        return this;
    },

    checkLfdSearchFunctionality: function (numberOfListItemToSearch) {
        const listItemTitleLocatorByNumber = `(//*[contains(@class,'item-title') or @class='small-card-list-name'])[${numberOfListItemToSearch}]`;
        const searchInputFieldLocator = `//input[contains(@class, "form-control search-feed")]`;
        const listItemTitleLocator = '//*[contains(@class,"search-results-holder") or contains(@class,"list-wrapper")]//*[contains(@class,"item-title")' +
            ' or @class="small-card-list-name"]';

        this
            .api.useXpath()
            .waitForElementVisible(listItemTitleLocatorByNumber, this.api.globals.smallWait)
            .getText(listItemTitleLocatorByNumber, (text) => {
                this.api
                    .waitForElementVisible(searchInputFieldLocator, this.api.globals.smallWait)
                    .click(searchInputFieldLocator)
                    .setValue(searchInputFieldLocator, text.value.substring(0, text.value.indexOf(' ')))
                    .keys([this.api.Keys.ENTER])
                    .pause(1000)
                    .waitForElementVisible(listItemTitleLocator)
                    .useCss()
                    .elements('xpath', listItemTitleLocator, (result) => {
                        for (let i = 0; i < result.value.length; i++) {
                            this.api.elementIdText(result.value[i].ELEMENT, function (itemText) {
                                this.assert.ok(itemText.value.includes(text.value.substring(0, text.value.indexOf(' '))))
                            });
                        }
                    });
            });

        return this //TODO: .current-query to test text also
            .waitForElementVisible('@closeButtonOnCurrentQueryHolder', this.api.globals.smallWait)
            .click('@closeButtonOnCurrentQueryHolder')
            .waitForElementNotVisible('@closeButtonOnCurrentQueryHolder', this.api.globals.smallWait);
    },

    checkDirectoryLFDScreen: function () {
        return this
            .waitForElementVisible('@profileIcon', this.api.globals.smallWait)
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
    },

    checkLfdFilterFunctionality: function () {
        const filterControlTitleLocator = '.btn.hidden-filter-controls-filter';
        const listItemTitleForFilterLocator = '.list-item-subtitle, .news-feed-date-category, .search-results-holder .agenda-item-title';

        this
            .waitForElementVisible('@listFilterIcon', this.api.globals.smallWait)
            .click('@listFilterIcon')
            .waitForElementVisible('@filterControlTitle', this.api.globals.mediumWait)
            .api.elements('css selector', filterControlTitleLocator, (result) => {
            const randomFilterValue = Math.floor(Math.random() * Math.floor(result.value.length));

            this.logTestInfo(randomFilterValue);
            this.api.elementIdText(result.value[randomFilterValue].ELEMENT, text => {
                this.api.elementIdClick(result.value[randomFilterValue].ELEMENT, () => {
                    this.api.elementIdAttribute(result.value[randomFilterValue].ELEMENT, 'class', classValue => {
                        this.assert.ok(classValue.value.includes('active'))
                            .api.elements('css selector', listItemTitleForFilterLocator, (elements) => {
                            for (let i = 0; i < elements.value.length; i++) {
                                this.api.elementIdText(elements.value[i].ELEMENT, elementsText => {
                                    this.assert.ok((elementsText.value.toUpperCase()).includes(text.value.toUpperCase()), 'The filter works as expected');
                                })
                            }
                        })
                    });
                });
            });
        });

        return this
            .waitForElementVisible('@cancelFilterModeButton', this.api.globals.smallWait)
            .click('@cancelFilterModeButton')
            .waitForElementNotVisible('@filterControlTitle', this.api.globals.smallWait);
    },

    checkAgendaLfdDaysFunctionality: function () {
        return this
            .waitForElementVisible('@notActiveDayInAgendaLfd', this.api.globals.smallWait)
            .getText('@notActiveDayInAgendaLfd', (result) => {
                this
                    .click('@notActiveDayInAgendaLfd')
                    .waitForElementVisible('@activeDayInAgendaLfd', this.api.globals.smallWait)
                    .assert.containsText('@activeDayInAgendaLfd', result.value)
            });
    },

    checkBookmarkedLfdItem: function () {
        return this
            .waitForElementVisible('@toggleBookmarksIcon', this.api.globals.tinyWait)
            .click('@toggleBookmarksIcon')
            .waitForElementNotPresent('@listItemContent', this.api.globals.smallWait)
            .click('@toggleBookmarksIcon')
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait);
    },

    checkRssScreenUpdate: function () {
        const tapToRefreshLocator = '.btn.btn-link.pull-to-refresh';
        const updateInfoLocator = '#date';

        return this
            .waitForElementVisible(tapToRefreshLocator, this.api.globals.smallWait)
            .click(tapToRefreshLocator)
            .waitForElementVisible(updateInfoLocator, this.api.globals.smallWait)
            .assert.containsText(updateInfoLocator, 'Last updated: a few seconds ago');
    },

    checkRssFeedPanel: function () {
        const feedPanelLineLocator = '.feed-panels.line';
        const linkedFeedItemLocator = '.linked.feed-item';

        return this
            .assert.elementPresent(feedPanelLineLocator)
            .waitForElementVisible(linkedFeedItemLocator, this.api.globals.smallWait)
            .click(linkedFeedItemLocator)
            .waitForElementVisible('@overlayPanel', this.api.globals.mediumWait);
    },

    checkArticleOverlayPanel: function () {
        const readOnlineButtonLocator = '.actionButton';

        return this
            .waitForElementVisible('@closeOverlayButton', this.api.globals.smallWait)
            .assert.elementPresent(readOnlineButtonLocator)
            .assert.containsText(readOnlineButtonLocator, 'Read Online')
            .click('@closeOverlayButton')
            .waitForElementNotPresent('@overlayPanel', this.api.globals.mediumWait);
    },

    checkAboutThisAppOverlay: function () {
        const checkUpdatesButtonLocator = '.update-buttons';

        return this
            .waitForElementVisible('@overlayPanel', this.api.globals.mediumWait)
            .assert.elementPresent(checkUpdatesButtonLocator);
    },

    getDeviceIdFromAboutAppOverlay: function (deviceId) {
        const deviceIdInfoLocator = '.session-id';

        return this
            .waitForElementVisible(deviceIdInfoLocator, this.api.globals.tinyWait)
            .getText(deviceIdInfoLocator, (text) => {
                deviceId.push(text.value);
            });
    },

    closeAboutThisAppOverlay: function () {
        return this
            .waitForElementVisible('@closeButtonOnAboutThisAppOverlay', this.api.globals.mediumWait)
            .click('@closeButtonOnAboutThisAppOverlay')
            .waitForElementNotPresent('@overlayPanel', this.api.globals.mediumWait);
    },

    switchToNewWindow: function (componentToClick, url, windowNumber = 2) {
        this
            .api.pause(2000)
            .windowHandles(function (result) {
                this.switchWindow(result.value[windowNumber - 1]);
            });

        return this
            .checkOpenedWindowAndSwitchToIt(componentToClick, windowNumber)
            .assert.urlContains(url)
    },

    switchToOpenWindowByNumber: function (number) {
        this
            .api.pause(4000)
            .windowHandles(function (result) {
                this.switchWindow(result.value[number - 1]);
            });

        return this;
    },

    checkChartScreen: function (amountOfChartVlaues) {
        const chartContainerLocator = '.chart-container';

        return this
            .waitForElementVisible(chartContainerLocator, this.api.globals.mediumWait)
            .assertAmountOfElementsVisible('@chartComponent', amountOfChartVlaues)
            .waitForElementVisible('@chartListItem', this.api.globals.mediumWait)
    },

    checkChartColumnsFunctionality: function () {
        return this
            .click('@chartListItem')
            .waitForElementNotPresent('@chartComponent', this.api.globals.mediumWait)
            .assert.attributeContains('@chartListItem', 'class', 'hidden')
            .click('@chartListItem');
    },

    getTotalNumberOFChartEntries: function (totalNumberOfEntries) {
        this
            .waitForElementVisible('@chartTotalNumberOfEntries', this.api.globals.smallWait)
            .getText('@chartTotalNumberOfEntries', (text) => totalNumberOfEntries.unshift(text.value));

        return totalNumberOfEntries;
    },

    checkChartDatSourceProvider: function (totalNumberOfEntries) {
        return this
            .waitForElementVisible('@chartTotalNumberOfEntries', this.api.globals.smallWait)
            .assert.containsText('@chartTotalNumberOfEntries', parseInt(totalNumberOfEntries),
                "Total amount of chart entries after form submission is correct");
    },

    checkSelectChatValueFunctionality: function () {
        return this
            .click('@chartListItem')
            .assert.attributeContains('@chartListItem', 'class', 'hidden')
            .assert.attributeContains('@chartComponent', 'visibility', 'hidden')
            .click('@chartComponent')
            .assert.attributeContains('@chartComponent', 'class', 'select');
    },

    checkAppListSignOutButton: function () {
        this
            .waitForElementVisible('@signOutButton', this.api.globals.smallWait)
            .click('@signOutButton')
            .api.dismissAlert();

        return this;
    },

    clickSignOutButtonInAppList: function () {
        return this
            .waitForElementVisible('@signOutButton', this.api.globals.smallWait)
            .click('@signOutButton')
            .waitForElementVisible('@signOutButtonOnAlert', this.api.globals.smallWait);
    },

    clickSignOutButtonOnAlert: function () {
        return this
            .waitForElementVisible('@signOutButtonOnAlert', this.api.globals.smallWait)
            .click('@signOutButtonOnAlert')
            .waitForElementNotPresent('@signOutButtonOnAlert', this.api.globals.smallWait);
    },

    checkAppDeleteActionInAppList: function () {
        return this
            .waitForElementVisible('@menuAppButton', this.api.globals.smallWait)
            .waitForElementNotVisible('@deleteAppButton', this.api.globals.smallWait)
            .click('@menuAppButton')
            .waitForElementVisible('@deleteAppButton', this.api.globals.smallWait)
            .assert.containsText('@deleteAppButton', 'Delete');
    },

    checkGalleryImages: function (amountOfImages) {
        const openImageLocator = '.pswp';

        this
            .assertAmountOfElementsVisible('@galleryImage', amountOfImages)
            .click('@galleryImage')
            .waitForElementVisible(openImageLocator, this.api.globals.smallWait)
            .click(openImageLocator)
            .expect.element(openImageLocator).to.not.be.visible.before(this.api.globals.smallWait);

        return this;
    },

    checkImagesInsideAccordionComponent: function (amountOfPanels) {
        return this
            .assertAmountOfElementsVisible('@accordionPanel', amountOfPanels)
            .waitForElementNotVisible('@imageComponent', this.api.globals.smallWait)
            .click('@accordionPanel')
            .waitForElementVisible('@imageComponent', this.api.globals.mediumWait)
            .assert.attributeContains('@accordionPanel', 'aria-expanded', 'true');
    },

    checkAccordionHeadingCollapsing: function () {
        this
            .waitForElementVisible('@accordionPanel', this.api.globals.smallWait)
            .click('@accordionPanel')
            .assert.attributeContains('@accordionPanel', 'aria-expanded', 'false')
            .api.pause(2000);

        return this;
    },

    checkAccordionHeadingExpanding: function () {
        this
            .waitForElementVisible('@accordionPanel', this.api.globals.smallWait)
            .click('@accordionPanel')
            .assert.attributeContains('@accordionPanel', 'aria-expanded', 'true')
            .api.pause(2000);

        return this;
    },

    assertOfflineVideoComponentIsPresent: function () {
        return this
            .waitForElementVisible('@offlineVideoComponent', this.api.globals.mediumWait)
            .assert.attributeContains('@offlineVideoComponent', 'data-name', 'Offline Video');
    },

    checkOfflineVideo: function () {
        this
            .waitForElementVisible('@offlineVideo', this.api.globals.mediumWait)
            .api.pause(1000)
            .refresh()
            .pause(2000);

        return this
            .waitForElementNotPresent('@offlineVideo', this.api.globals.mediumWait);
    },

    checkOnlineVideo: function () {
        this
            .waitForElementVisible('@onlineVideoComponent', this.api.globals.mediumWait)
            .assert.attributeContains('@onlineVideoComponent', 'data-name', 'Online Video')
            .click('@onlineVideoImage')
            .assert.elementNotPresent('@onlineVideoImage')
            .api.pause(1000)
            .refresh()
            .pause(2000);

        return this;
    },

    checkInteractiveGraphicsMaps: function (amountOfMaps) {
        return this
            .assertAmountOfElementsPresent('@interactiveGraphicsMap', amountOfMaps)
            .waitForElementVisible('@activeInteractiveGraphicsMap', this.api.globals.longWait);
    },

    checkInteractiveGraphicsMarkers: function (amountOfMarkers) {
        const markerToChooseLocator = '.map-wrapper.active div.marker:not([class*=active])';
        const markerTitleHolderLocator = `.interactive-map-label-text`;

        this
            .assertAmountOfElementsPresent('@interactiveGraphicsMarker', amountOfMarkers)
            .waitForElementVisible(markerToChooseLocator, this.api.globals.mediumWait)
            .getAttribute(markerToChooseLocator, 'data-name', function (markerName) {
                this
                    .click(markerToChooseLocator)
                    .waitForElementVisible(markerTitleHolderLocator, this.globals.smallWait)
                    .assert.containsText(markerTitleHolderLocator, markerName.value, `Chosen marker is active ${markerName.value}`)
            });

        return this;
    },

    switchBetweenMaps: function (nameOfMapToSwitch) {
        const mapNameHolderLocator = `//p[@class="map-list-text" and text()='${nameOfMapToSwitch}']`;

        this
            .waitForElementVisible('@interactiveGraphicsMapTitleHolder', this.api.globals.smallWait)
            .click('@interactiveGraphicsMapTitleHolder')
            .waitForElementVisible('@interactiveMapsOverlay', this.api.globals.mediumWait)
            .api.useXpath()
            .click(mapNameHolderLocator)
            .waitForElementNotVisible(mapNameHolderLocator, this.api.globals.mediumWait)
            .useCss();

        return this
            .assert.containsText('@interactiveGraphicsMapTitleHolder', nameOfMapToSwitch);
    },

    assertAppListIsHiddenBySingInButton: function () {
        return this
            .waitForElementVisible('@signInAppListButton', this.api.globals.longWait)
            .assert.containsText('@signInAppListButton', 'Sign in')
    },

    checkTheAppInAppList: function (appName) {
        return this
            .waitForElementVisible('@appTitleInAppList', this.api.globals.longWait)
            .assert.containsText('@appTitleInAppList', appName)
    },

    clickAppIconInAppList: function (elementnumber = 1) {
        const appIconInAppList = '.list-image';

        this
            .waitForElementVisible(appIconInAppList, this.api.globals.longWait)
            .api.elements('css selector', appIconInAppList, function (result) {
            this
                .moveTo(result.value[elementnumber - 1].ELEMENT)
                .mouseButtonClick();
        })
            .waitForElementNotPresent(appIconInAppList, this.api.globals.longWait);

        return this;
    },

    checkInlineLink: function (label) {
        return this
            .waitForElementVisible('@inlineLink', this.api.globals.longWait)
            .assert.containsText('@inlineLink', label)
    },

    assertInlineLinkCorrectTextColor: function (color) {
        return this
            .waitForElementVisible('@inlineLink', this.api.globals.longWait)
            .assertElementPropertyHasCorrectColor('@inlineLink', 'color', color)
    },

    assertInlineLinkCorrectTextFontSize: function (fontSize) {
        return this
            .waitForElementVisible('@inlineLink', this.api.globals.longWait)
            .assert.cssProperty('@inlineLink', 'font-size', `${fontSize}px`,
                `Inline link text has the correct font size ${fontSize}`)
    },

    clickSingUpButton: function () {
        return this
            .waitForElementVisible('@signUpButton', this.api.globals.smallWait)
            .click('@signUpButton')
            .waitForElementNotPresent('@signUpButton', this.api.globals.smallWait);
    },

    checkSmallCardLfd: function (listItemText) {
        const dynamicListItemLocator = '.small-h-card-list-item-text';
        const listOfTextValues = [];

        this
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
            .waitForElementVisible(dynamicListItemLocator, this.api.globals.mediumWait)
            .api.elements('css selector', dynamicListItemLocator, function (elements) {
            for (let i = 0; i < elements.value.length; i++) {
                this.elementIdText(elements.value[i].ELEMENT, (entryText) => {
                    listOfTextValues.push(entryText.value);
                })
            }
            return listOfTextValues;
        })
            .logTestInfo(listOfTextValues)
            .pause(2000)
            .perform(() => {
                this.assert.ok(listOfTextValues.includes(listItemText), `Person with name ${listItemText} is present in list.`)
            });

        return this;
    },

    openAndCheckLfdItemDetails: function () {
        return this
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
            .click('@listItemContent')
            .assert.visible('@lfdItemDetailsOverlay', '')
    },

    openAndCheckLfdItemDetails2: function () {
        return this
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
            .click('@listItemContent')
            .assert.visible('@lfdItemDetailsOverlay2', '')
    },

    openAndCheckLfdItemDetailsOurNews: function () {
        return this
            .waitForElementVisible('@listItemContent', this.api.globals.smallWait)
            .click('@listItemContent')
            .assert.visible('@lfdItemDetailsOverlayOurNews', '')
    },

    openLfdItemDetailsByTitle: function (lfdItemTitle) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(lfdItemTitleLocator, lfdItemTitle), this.api.globals.longWait)
            .click(util.format(lfdItemTitleLocator, lfdItemTitle),)
            .useCss();

        return this
            .assert.visible('@lfdItemDetailsOverlay', 'LFD item details are open.')
    },

    openAndCheckLfdBookmarkedItemDetails: function () {
        return this
            .waitForElementVisible('@lfdItemTitle', this.api.globals.smallWait)
            .click('@lfdItemTitle')
            .assert.visible('@lfdItemDetailsOverlayOurNews')
    },

    openAndCheckLfdEatingSchedule: function () {
        return this
            .waitForElementVisible('@lfdItemTitleEatingSchedule', this.api.globals.smallWait)
            .click('@lfdItemTitleEatingSchedule')
            .assert.visible('@lfdItemDetailsOverlayEatingSchedule')
    },

    openAndCheckLfdEatingScheduleBookmark: function () {
        return this
            .waitForElementVisible('@lfdItemTitleEatingScheduleBookmark', this.api.globals.smallWait)
            .click('@lfdItemTitleEatingScheduleBookmark')
            .assert.visible('@lfdItemDetailsOverlayEatingSchedule')
    },

    closeLfdItemDetailsOverlay: function () {
        this
            .waitForElementVisible('@closeButtonOnLfdItemDetailsOverlay', this.api.globals.smallWait)
            .click('@closeButtonOnLfdItemDetailsOverlay')
            .waitForElementNotPresent('@lfdItemDetailsOverlay', this.api.globals.smallWait)
            .api.pause(2000);

        return this;
    },

    checkListWithPanels: function (amountOfPanels) {
        return this
            .assertAmountOfElementsVisible('@listPanels', amountOfPanels)
            .assertAmountOfElementsVisible('.list-image', amountOfPanels)
            .assertAmountOfElementsVisible('.list-title', amountOfPanels);
    },

    clickPanelByNumber: function (numberOfListPanel) {
        const listPanelLocator = `(//li[contains(@class,"panels linked")])[${numberOfListPanel}]`;

        this
            .api.useXpath()
            .waitForElementVisible(listPanelLocator, this.api.globals.smallWait)
            .click(listPanelLocator)
            .useCss();

        return this;
    },

    checkMetroComponent: function (amountOfMetroPanels) {
        return this
            .waitForElementVisible('@metroComponent', this.api.globals.smallWait)
            .assertAmountOfElementsVisible('@listPanels', amountOfMetroPanels)
            .assertAmountOfElementsVisible('.metro-title', amountOfMetroPanels)
            .assertAmountOfElementsVisible('.fa.fa-share', amountOfMetroPanels);
    },

    clickNotification: function (title) {
        this
            .api.pause(2000)
            .useXpath()
            .waitForElementVisible(util.format(notificationTitle, title), this.api.globals.longWait)
            .element('xpath', util.format(notificationTitle, title), function (result) {
                this.moveTo(result.value.ELEMENT)
                    .elementIdClick(result.value.ELEMENT)
            })
            .useCss()
            .pause(2000);
        return this;
    },

    checkIfNotificationHasBeenClicked: function (title) {
        const resultDisplaying = [];

        this
            .waitForElementNotPresentWithoutErrors('.notifications-holder .title', 5000, resultDisplaying)
            .api.perform(function () {
            if (resultDisplaying[0] === false) {
                this.api.useXpath()
                    .waitForElementVisible(util.format(notificationTitle, title), this.api.globals.smallWait)
                    .click(util.format(notificationTitle, title))
                    .useCss();
            }
        });

        return this
            .waitForElementNotPresent('@notificationsHolder', this.api.globals.mediumWait);
    },

    checkNotificationComponentElements: function () {
        return this
            .waitForElementVisible('@notificationsHolder', this.api.globals.longWait)
            .waitForElementVisible('@refreshNotifications', this.api.globals.longWait)
            .waitForElementNotPresent('@notificationLoadingSpinner', this.api.globals.longWait);
    },

    clickAllowNotificationOnPopup: function () {
        return this
            .waitForElementVisible('@allowNotificationsButtonOnPopup', this.api.globals.smallWait)
            .click('@allowNotificationsButtonOnPopup')
            .waitForElementNotVisible('@allowNotificationsButtonOnPopup', this.api.globals.smallWait);
    },

    allowNotificationOnPopup: function (popupNumber = 1) {
        this
            .api.pause(5000)
            .useXpath()
            .isVisible(util.format(allowNotificationPopup, popupNumber), function (result) {
                if (result.value === true) {
                    this
                        .logTestInfo('Allow notification popup is shown.')
                        .waitForElementVisible(util.format(allowNotificationPopup, popupNumber), this.globals.smallWait)
                        .click(util.format(allowNotificationPopup, popupNumber))
                        .waitForElementNotVisible(util.format(allowNotificationPopup, popupNumber), this.globals.smallWait);
                } else {
                    this
                        .logTestInfo('Allow notification popup is not shown.');
                }
            })
            .useCss();

        return this;
    },

    refreshToUpdateNotificationBox: function (done) {
        this
            .api.refresh()
            .pause(15000);

        this.checkNotificationComponentElements(() => {
            done()
        });

        return this;
    },

    assertNotificationIsNotPresentInTheBox: function (title) {
        this
            .api.useXpath()
            .waitForElementNotPresent(util.format(notificationTitle, title), this.api.globals.smallWait)
            .useCss();

        return this;
    },

    assertNotificationIsPresentInTheBox: function (title) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(notificationTitle, title), this.api.globals.longWait)
            .useCss();

        return this;
    },

    checkNotificationStatus: function (title, option) {
        this
            .api.useXpath()
            .waitForElementPresent(util.format(notificationTitle, title) + '/parent::*', this.api.globals.longWait)
            .assert.attributeContains(util.format(notificationTitle, title) + '/parent::*', 'class', `notification-${option}`,
            `The notification with ${title} is shown as read.`)
            .useCss();

        return this;
    },

    checkNotificationMessage: function (notificationText, notificationNumber) {
        this
            .api.useXpath()
            .waitForElementVisible(util.format(notificationMessage, notificationNumber || 1), this.api.globals.longWait)
            .assert.containsText(util.format(notificationMessage, notificationNumber || 1), notificationText)
            .useCss();

        return this;
    },

    clickMarkAllAsRead: function () {
        return this
            .waitForElementVisible('@markNotificationAsReadLink', this.api.globals.mediumWait)
            .clickElementAndCheckElementNotPresent('@markNotificationAsReadLink', '@markNotificationAsReadLink');
    },

    clickAboutAppLinkOnNotificationBox: function () {
        return this
            .waitForElementVisible('@aboutAppLinkOnNotificationBox', this.api.globals.smallWait)
            .click('@aboutAppLinkOnNotificationBox')
            .waitForElementNotPresent('@lfdItemDetailsOverlay', this.api.globals.smallWait)
    },

    checkDocumentIsOpen: function (mediaId) {
        this
            .api.pause(1000)
            .url(function (result) {
                this.assert.ok(result.value.includes(mediaId), `The document is open and URL contains the document name ${mediaId}. 
         The URL: ` + result.value);
            });

        return this;
    },

    clickDeleteButtonOnLfdItemDetailedView: function () {
        return this
            .waitForElementVisible('@deleteButtonOnLfdItemDetailedView', this.api.globals.smallWait)
            .click('@deleteButtonOnLfdItemDetailedView')
            .waitForElementVisible('@deleteButtonOnConformationModal', this.api.globals.smallWait);
    },

    confirmLfdItemDeleting: function () {
        return this
            .waitForElementVisible('@deleteButtonOnConformationModal', this.api.globals.smallWait)
            .click('@deleteButtonOnConformationModal')
            .waitForElementNotPresent('@deleteButtonOnConformationModal', this.api.globals.smallWait)
            .assert.elementNotPresent(' @lfdItemDetailsOverlay', 'The LFD item has been removed.')
    },

    assertContainerHasCorrectImageForBackground: function (media) {
        return this
            .waitForElementVisible('@containerWidget', this.api.globals.smallWait)
            .getCssProperty('@containerWidget', elementProperties.BACKGROUND_IMAGE, function (result) {
                this.assert.ok(result.value.includes(media), `The correct image ${media} is selected for container background.`);
            });
    }
};

module.exports = {
    commands: [commands],
    elements: {
        burgerIcon: {
            selector: '.nav-right'
        },
        menu: {
            selector: '.fl-menu-panel'
        },
        emailField: {
            selector: '.form-control[class*=email]'
        },
        passwordField: {
            selector: '.form-control[class*=password]'
        },
        continueButtonForLogin: {
            selector: '.btn.btn-primary.btn-continue'
        },
        loginButton: {
            selector: '.btn.btn-primary.btn-login'
        },
        skipButton: {
            selector: '.ob-skip span'
        },
        forgotPassword: {
            selector: '.btn.btn-link.btn-forget-pass, .btn.btn-link.btn-forgot-pass'
        },
        backToLoginButton: {
            selector: '.btn.btn-link[class*=back]'
        },
        resetPasswordEmailField: {
            selector: '.form-control[class*=email]:not([class*=_email])'
        },
        menuPanel: {
            selector: '.fl-widget-instance :nth-child(1).fl-menu-body'
        },
        listItemContent: {
            selector: '.image-banner, .list-item-image, [class*=card-list-image], div[data-view=loop] .active .agenda-list-item-content, ' +
                'div[data-view=loop] .agenda-list-item-content'
        },
        profileIcon: {
            selector: '.my-profile-icon'
        },
        listFilterIcon: {
            selector: '.fa.fa-sliders'
        },
        filterControlTitle: {
            selector: '//div[@class="btn hidden-filter-controls-filter focus-outline"]',
            locateStrategy: 'xpath'
        },
        overlayPanel: {
            selector: '.overlayPanel'
        },
        closeOverlayButton: {
            selector: '.overlayPanel .closeButton'
        },
        chartComponent: {
            selector: '.highcharts-series > .highcharts-point',
        },
        chartListItem: {
            selector: 'g.highcharts-legend-item',
        },
        signOutButton: {
            selector: '.portal-login-utils a'
        },
        menuAppButton: {
            selector: '.initial.fa.fa-ellipsis-v'
        },
        deleteAppButton: {
            selector: '.list-swipe-action'
        },
        galleryImage: {
            selector: 'div.brick img'
        },
        accordionPanel: {
            selector: '.panel.panel-default .panel-title'
        },
        onboardingSlideContent: {
            selector: '.onboarding-content'
        },
        loginErrorMessage: {
            selector: '.text-danger.login-error'
        },
        imageComponent: {
            selector: 'span[data-name="Image"] img'
        },
        buttonComponent: {
            selector: 'span > input.btn'
        },
        activeSlideImage: {
            selector: '.swiper-slide-active img.swiper-slide-image'
        },
        activeSlideButton: {
            selector: '.swiper-slide-active .btn.btn-primary'
        },
        offlineVideoComponent: {
            selector: 'div[data-widget-package="com.fliplet.online-offline"]'
        },
        onlineVideoComponent: {
            selector: 'div[data-widget-package="com.fliplet.online-video"]'
        },
        onlineVideoImage: {
            selector: 'div[data-video-online-id] img'
        },
        interactiveGraphicsMap: {
            selector: 'div.map-wrapper'
        },
        activeInteractiveGraphicsMap: {
            selector: '.map-wrapper.active .map-container'
        },
        interactiveGraphicsMarker: {
            selector: '.map-wrapper.active div.marker'
        },
        interactiveGraphicsMapTitleHolder: {
            selector: '.maps-button.active p'
        },
        interactiveMapsOverlay: {
            selector: '.interactive-maps-overlay.overlay-open'
        },
        signInAppListButton: {
            selector: 'a.hidden-xs.login-button'
        },
        appTitleInAppList: {
            selector: '.app-list .list-title'
        },
        inlineLink: {
            selector: 'a[data-inline-link-id], .foot-note a'
        },
        screenTitle: {
            selector: '.nav-title span'
        },
        signUpButton: {
            selector: 'input[value="Sign up"]'
        },
        secondaryButton: {
            selector: '.btn.btn-secondary'
        },
        chartTotalNumberOfEntries: {
            selector: '.highcharts-data-labels'
        },
        lfdItemDetailsOverlay: {
            selector: '.small-h-card-detail-wrapper'
        },
        lfdItemDetailsOverlay2: {
            selector: '.small-card-list-detail-content-wrapper'
        },
        lfdItemDetailsOverlayOurNews: {
            selector: '.simple-list-detail-wrapper'
        },
        lfdItemDetailsOverlayEatingSchedule: {
            selector: '.agenda-detail-overlay-content'
        },
        closeButtonOnLfdItemDetailsOverlay: {
            selector: '[class*="overlay-close"] .close-icon'
        },
        metroComponent: {
            selector: '.metro-panels.ready'
        },
        listPanels: {
            selector: '.panels.linked'
        },
        toggleBookmarksIcon: {
            selector: '.toggle-bookmarks, .agenda-list-controls'
        },
        lfdItemTitle: {
            selector: '//*[contains(@class,"search-results-holder") or contains(@class,"list-wrapper")]//*[contains(@class,"item-title")]',
            locateStrategy: 'xpath'
        },
        lfdItemTitleEatingSchedule: {
            selector: '.agenda-item-inner-content.clearfix'
        },
        lfdItemTitleEatingScheduleBookmark: {
            selector: '//h3/parent::div/div',
            locateStrategy: 'xpath'
        },
        lfdItemBookmarkedIconOnOverlay: {
            selector: '[class*=detail-wrapper] [class*=" bookmarked"] .fa.fa-bookmark'
        },
        closeButtonOnCurrentQueryHolder: {
            selector: '.current-query-wrapper .clear-search'
        },
        notActiveDayInAgendaLfd: {
            selector: 'li[id]:not([class=placeholder]):not([class=active]) .day'
        },
        activeDayInAgendaLfd: {
            selector: '.active .day'
        },
        offlineVideo: {
            selector: '#flLinkVideo'
        },
        closeButtonOnAboutThisAppOverlay: {
            selector: '.overlayPanel> .closeButton'
        },
        cancelFilterModeButton: {
            selector: '.list-search-cancel'
        },
        bookmarkedIcon: {
            selector: '.btn-bookmarked'
        },
        markNotificationAsReadLink: {
            selector: '.toolbar-read-all a'
        },
        refreshNotifications: {
            selector: 'i.fa-refresh.pull-right'
        },
        notificationsHolder: {
            selector: '.notifications-holder'
        },
        notificationLoadingSpinner: {
            selector: '.fa.fa-spinner.fa-pulse'
        },
        notificationTitle: {
            selector: '.notifications-holder .title'
        },
        aboutAppLinkOnNotificationBox: {
            selector: '.fa-cog.pull-right'
        },
        deleteButtonOnLfdItemDetailedView: {
            selector: '.dynamic-list-controls .dynamic-list-delete-item'
        },
        deleteButtonOnConformationModal: {
            selector: '.action-sheet button.action-sheet-option'
        },
        allowNotificationsButtonOnPopup: {
            selector: '.popup-screen button[data-allow]'
        },
        signOutButtonOnAlert: {
            selector: '//a[@class="link "][text()="Sign out"]',
            locateStrategy: 'xpath'
        },
        containerWidget: {
            selector: '[data-name=Container]'
        }
    }
};