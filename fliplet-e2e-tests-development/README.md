# Fliplet End to End testing tool

A tool to test the Fliplet platform.

## Current limitations

So far tests are running on Chrome only.

## Requirements

- Docker & Docker compose
- Node.js & Npm

Docker & Docker compose can easily be installed on OSX with brew:

```
brew update
brew install docker docker-compose docker-machine
```

If `brew update` doesn't work, [fix its permissions](http://stackoverflow.com/questions/16432071/how-to-fix-homebrew-permissions) then go to `/usr/local` and run `git clean -df && git reset --hard origin/master` before running brew update again.

Alternatively, follow the instructions on the install docs for [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/).

*VirtualBox* might also need to be update to its latest version if you get troubles when installing *Docker*. You can check whether your machine is running by trying `docker-machine ls` and see whether you have a machine running. You should get an output similar to this:

```
NAME      ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER    ERRORS
default   *        virtualbox   Running   tcp://192.168.99.100:2376           v1.11.0
```

If the machine is not listed, you can create one by running `docker-machine create --driver virtualbox default`.

Once everything is installed, it is recommended to add `eval $(docker-machine env)` to your *bash profile* to avoid having to run it every time you open a new bash session.

## Usage

Add users to your environment variables: (password is the same for all of them and should be included as a parameter when running the tool)
```bash
export FLIPLET_E2E_EMAIL=qa+10@fliplet.com
export FLIPLET_E2E_EMAIL2=qa+20@fliplet.com
export FLIPLET_E2E_EMAIL3=qa+30@fliplet.com
export FLIPLET_E2E_EMAIL_FOR_ORG=qa+5@fliplet.com
```

Boot selenium with

```
docker-compose up
```

Then, run `npm install` to install the local dependencies and `npm link` to link the `fliplet-e2e-tests` executable globally on your machine.

Finally, run the following command to run the tests:

```
fliplet-e2e-tests -w https://staging.studio.fliplet.com -p PASSWORD
```

You can specify a test suite with:

```
fliplet-e2e-tests tests/apps -w https://staging.studio.fliplet.com -p PASSWORD
```

Or a specific test with:

```
fliplet-e2e-tests tests/apps/01-browse.js -w https://staging.studio.fliplet.com -p PASSWORD
```

---

## Tests structure

[Page objects](http://nightwatchjs.org/guide#page-objects), under `/page-objects` should be created whenever is suited as this will allow reusability, not only for sections/elements but also from commands.  
Nightwatch looks for tests under tthe `/tests` folder and will run them by the order they are found. So if you want some tests to be run first than another please prefix them with numbers to create the desired order.  
Some custom commands specific to our platform are under `/custom-commands`. For example the `dragAndDrop` simulates what is done when we drag a component and drop it on the device preview.
When it comes to the tests, they can be structured using multiple tests in one suite or mutltiple steps in one test or even a combination of both. 

DRY should be followed as a practice.

### Writing new tests

Documentation on [Nightwatch Developer Guide](http://nightwatchjs.org/guide) should be followed, so that you are organised and follow best testing practises.  
The tester should follow Fliplet’s testing structure when creating new tests for a scenario or user journey:
1. Create new folder under `/tests` with the same structure as `/tests/apps`
2. WHen possible by first creating "before" and "after" TDD actions to seed the data and clean up afterwards, or writing a separate test/step to clean up.
3. Add the new scenarios without any logic in it, then run the tool and verify your new tests are all failing
4. Add the logic for running the test and run the suite after each test you write to verify it’s working
5. Once the scenario has been added and tested locally, create a new branch called “feat-<scenario-name>” and push your work to GitHub following a descriptive commit message. Then, create a pull request from your branch to the master branch so that Fliplet developers can review your work before getting it merged and published to npm.

 A scenario should be multiple times with different data (either static constants or randomly generated using casual) depending on the scenario. Fliplet will provide a track of the variations required to mark the journey as covered.  
Your work will be reviewed to ensure:
- it meets the test plan given to the tester
- it conforms to Fliplet Javascript coding standards, uses ES6, functional programming whenever required
- its coverage is equal or above our desired metrics
- tests run in a suitable time
- tests do not fluctuate
