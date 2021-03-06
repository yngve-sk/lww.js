let LWWManager;
if (typeof require === 'function')
    LWWManager = require('../src/lww');
else
    LWWManager = window.LWWManager;

let TheManager = new LWWManager({});

let BTN_HEIGHT = 30,
    BTN_LENGTH = 75,

    HEADER_HEIGHT = 20,
    RESIZE_MARGIN = 4,

    MIN_SIZE = [200, 200],
    SIZE = [500, 500],
    MAX_SIZE = [1200, 1200],

    LOC = [250, 250],

    BUTTONS = ['collapse', 'minimize', 'minsize', 'maximize', 'close'],
    NUM_WINDOWS = 2,

    DOCK_OFFSET = '5%';

let DOCKS = {};

for (let flow of ['vertical', 'horizontal'])
    for (let xAnchor of ['left', 'right'])
        for (let yAnchor of ['top', 'bottom']) {
            let name = flow.substr(0, 1) + '-' + xAnchor.substr(0, 1) + '-' + yAnchor.substr(0, 1);
            name = name.toUpperCase();
            DOCKS[name] = {
                anchor: {
                    x: xAnchor,
                    y: yAnchor,
                    offset: DOCK_OFFSET,
                    flow: flow
                },
                buttonHeight: BTN_HEIGHT,
                buttonLength: BTN_LENGTH,
                hideLabels: true,
                showIcons: true
            };
        }

let WINDOWS = [];

for (let i = 0; i < NUM_WINDOWS; i++) {
    WINDOWS.push({
        options: {
            title: 'Win' + i + '..',
            /*             minimizable: true,
                        maximizable: true,
                        collapsible: true,
             */
            buttons: BUTTONS.slice(0),

            bounds: {
                min: MIN_SIZE.slice(0),
                max: MAX_SIZE.slice(0),
                headerHeight: HEADER_HEIGHT,
            },

            resizeMargin: RESIZE_MARGIN,
            icon: undefined,
            dock: {
                //            name: 'left' // DEMO/DEBUG - will be set in the dock loop
            }
        },
        state: {
            override: 'none',
            size: SIZE.slice(0),
            location: LOC.slice(0).slice(0)
        }
    })
}

let NG_INJECT = (tag, dest, attributes) => {
    let $injector = angular.injector(['ng', 'LWWDemo']);
    let $rootScope = $injector.get('$rootScope'),
        $compile = $injector.get('$compile');

    let scope = $rootScope.$new();
    let innerHTML = angular.element(document.createElement(tag));

    for (let key in attributes)
        scope[key] = attributes[key];

    let compiled = $compile(innerHTML)(scope);
    angular.element(dest).append(compiled);

    return scope;
}

let app = angular.module('LWWDemo', []);

app.directive('lwwSettingsView', function () {
    return {
        restrict: "E",
        scope: true,
        template: `<div ng-model="win">
                    <textarea style="    width: 100%;
    height: 100%;
    font-family: monospace;
    background: black;
    color: navajowhite;">

    name = {{win.name}};
    MOUSE LOC: {{printMouse()}}
    state = {{printState()}};


    // Window config:
{{getStringified()}}
                    </textarea>
                    </div>`,
        link: function ($scope, el, attrs) {
            console.log(el);
            console.log($scope);
            console.log(attrs);
        },
        controller: ["$scope", "$timeout", function ($scope, $timeout) {

            let pretty = (json) => {
                return JSON.stringify(json, null, 4);
            }

            $scope.getStringified = () => {
                return `let config = ${pretty($scope.winConfig)}`;
            }

            $scope.printState = () => {
                return pretty($scope.win.state);
            }

            $scope.printMouse = () => {
                return pretty($scope.win.mouse);
            }


            let update = () => {
                $timeout(() => {
                    $scope.$apply();
                }, 0);
            }

            $scope.win.on('resizeStart', update);
            $scope.win.on('resize', update);
            $scope.win.on('resizeEnd', update);
            $scope.win.on('moveStart', update);
            $scope.win.on('move', update);
            $scope.win.on('moveEnd', update);
            $scope.win.on('mouseLocChanged', update);
        }]
    }
});

let count = 0;

for (let DOCKNAME in DOCKS) {
    let CONFIG = DOCKS[DOCKNAME];
    TheManager.createDock(DOCKNAME, CONFIG);

    for (let WINCONFIGTEMPLATE of WINDOWS) {
        let WINCONFIG = {
            options: Object.assign({}, WINCONFIGTEMPLATE.options),
            state: Object.assign({}, WINCONFIGTEMPLATE.state),
        };
        WINCONFIG.options.title += DOCKNAME;
        WINCONFIG.options.dock = {};
        WINCONFIG.options.dock.name = DOCKNAME;

        let windowName = 'window' + count++;

        TheManager.addWindow(windowName, WINCONFIG);

        let theWindow = TheManager.getWindow(windowName);
        theWindow.on('resizeStart', (args) => console.log("ResizeStart! " + args[1]));
        theWindow.on('resize', (args) => console.log("Resize! " + args[1]));
        theWindow.on('resizeEnd', (args) => console.log("ResizeEnd! " + args[1]));
        theWindow.on('moveStart', (args) => console.log("moveStart! " + args));
        theWindow.on('move', (args) => console.log("move! " + args));
        theWindow.on('moveEnd', (args) => console.log("moveEnd! " + args));

        let scope = TheManager.getWindow(windowName).injectAngularDirective('lww-settings-view', NG_INJECT, {
            winConfig: WINCONFIG,
            win: theWindow
        });

    }
}