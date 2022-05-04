// ==UserScript==
// @name         Crime捷径
// @namespace    TornExtensions
// @version      1.0
// @description  快捷犯罪
// @author       mirrorhye[2564936]
// @match        https://www.torn.com/crimes.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const $ = window.jQuery;

    const colors = {
        'red': '#ff7373',
        'green': '#8fbc8f',
        'salmon': '#F9CDAD',
    }

    function mir_getValue(key, default_value) {
        let val = window.localStorage.getItem(key);
        if (val === undefined || val === null) {
            return default_value;
        }
        try {
            val = JSON.parse(val);
            if (val == '[]') {
                val = []
            }
            return val;
        } catch (err) {
            console.log(err);
            return val;
        }
    }

    function mir_setValue(key, val) {
        return window.localStorage.setItem(key, JSON.stringify(val));
    }

    function validateCrimetype(crimetype) {
        let s = crimetype.split('-');
        if (s.length == 2 
            && parseInt(s[0]) > 1 && parseInt(s[0]) < crimeMap.length
            && parseInt(s[1])-1 >= 0 && parseInt(s[1])-1 < crimeMap[parseInt(s[0])].length
        ) return true;
        return false;
    }

    function crimeColor(nervetake) {
        let alpha = (nervetake - 2.0) / (18 - 2);
        return `rgb(${101+(198-101)*alpha}, ${165+(120-165)*alpha}, ${209+(221-209)*alpha})`;
    }

    function makeShortcutBtn(crimetype) {
        if (!validateCrimetype(crimetype)) {
            return ``;
        }
        let nervetake = parseInt(crimetype.split('-')[0]);
        let subtype =parseInt( crimetype.split('-')[1])-1;
        let crime = crimeMap[nervetake][subtype];
        let action = actionMap[nervetake];
        return `<form action="${action}" method="post" style="display:inline-block; margin:2px 5px">
            <input name="nervetake" type="hidden" value="${nervetake}">
            <input name="crime" type="hidden" value="${crime}">
            <input class="extcs-btn" crimetype="${crimetype}" style="padding:4px; background:${crimeColor(nervetake)}; border-radius:5px; color:white; cursor:pointer;" type="submit" value="${crimetype}">
        </form>`;
    }

    function makeShortcuts() {
        let title = $(".content-title");
        if ($(".captcha").length > 0 || $(".extcs-wrapper").length > 0) {
            if (title.next()[0] != $(".extcs-wrapper")[0]) {
                $(".extcs-wrapper").remove();
            }
            return;
        };
        title.after(`
            <div class="extcs-wrapper" style="margin:5px 0;">
                <div class="title-black" style="border-radius: 5px 5px 0 0; font-size:15px;">
                    <span>Crime Shortcut:</span>
                </div>
                <div class="cont-gray extcs" style="padding:5px 0;border-radius:0 0 5px 5px; font-size:15px;">
                </div>
            </div>`);

        let shortcuts = $(".extcs");
        let shortcutArr = mir_getValue("extcs-crimes", ["11-5", "18-1"]);
        shortcutArr.forEach((crimetype) => {
            shortcuts.append(makeShortcutBtn(crimetype));
        });
        // for (let i = 0; i < crimeMap.length; i++) {
        //     for (let j = 0; j < crimeMap[i].length; j++) {
        //         shortcuts.append(makeShortcutBtn(`${i}-${j+1}`));
        //     }
        // }
        shortcuts.append(`<span id="extcs-add" class="border-round" style="display:inline-block; cursor:pointer; margin:2px; padding:3px; color:white; background-color:${colors.green};">+</span>
        <span id="extcs-remove" class="border-round" style="display:inline-block; cursor:pointer; margin:2px; padding:3px; color:white; background-color:${colors.red};">x</span>`)

        $("#extcs-add").click(() => {
            if ($("#extcs-input").length > 0) { // 阻止点击事件
                return;
            }
            $("#extcs-add").html(`<span style="display:inline-block;"><input id="extcs-input" type="text" class="border-round" style="width:60px;" placeholder="18-1"></input>`);
            $("#extcs-input").focus();
            $("#extcs-input").blur(function() {
                let crimetype = $(this).val();
                // validate
                let s = crimetype.split('-');
                if (!validateCrimetype(crimetype)) {
                    return;
                }

                shortcutArr.push(crimetype);
                let validateArr = [];
                // validate
                shortcutArr.forEach((crimetype) => {
                    if (validateCrimetype(crimetype)) {
                        validateArr.push(crimetype);
                    }
                })
                mir_setValue("extcs-crimes", validateArr);
                $(".extcs-wrapper").remove();
            });
        });

        $("#extcs-remove").click(() => {
            if ($("#extcs-remove").hasClass("extcs-removing")) {
                $(".extcs-wrapper").remove();   // 直接重绘 简单粗暴
            } else {
                $(".extcs-btn").css("background-color", colors.red);
                $(".extcs-btn").addClass("extcs-removing");
                $("#extcs-remove").css("background-color", colors.salmon);
                $("#extcs-remove").addClass("extcs-removing");
            }
        });

        $(".extcs-btn").click(function(event) {
            if ($(this).hasClass("extcs-removing")) {
                event.preventDefault();
                let crimetype = $(this).attr('crimetype');
                let validateArr = [];
                shortcutArr.forEach((crimetype_) => {
                    if (validateCrimetype(crimetype) && crimetype !== crimetype_) {
                        validateArr.push(crimetype_);
                    }
                })
                mir_setValue("extcs-crimes", validateArr);
                console.log(`remove ${crimetype}`);
                $(".extcs-wrapper").remove();
            }
        })

        const OB = new MutationObserver(() => {
            OB.disconnect();
            makeShortcuts();
            OB.observe($(".content-wrapper")[0], {
                characterData: true,
                attributes: true,
                subtree: true,
                childList: true
            });
        });
        OB.observe($(".content-wrapper")[0], {
            characterData: true,
            attributes: true,
            subtree: true,
            childList: true
        });
    }

    // $("form[name='crimes']").attr('action')
    const actionMap = [
        "",  // 0
        "",  // 1
        "crimes.php?step=docrime2",  // 2
        "crimes.php?step=docrime2",  // 3
        "crimes.php?step=docrime3",  // 4
        "crimes.php?step=docrime4",  // 5
        "crimes.php?step=docrime4",  // 6
        "crimes.php?step=docrime4",  // 7
        "crimes.php?step=docrime4",  // 8
        "crimes.php?step=docrime4",  // 9
        "crimes.php?step=docrime4",  // 10
        "crimes.php?step=docrime4",  // 11
        "crimes.php?step=docrime4",  // 12
        "crimes.php?step=docrime4",  // 13
        "crimes.php?step=docrime4",  // 14
        "crimes.php?step=docrime4",  // 15
        "crimes.php?step=docrime4",  // 16
        "crimes.php?step=docrime4",  // 17
        "crimes.php?step=docrime4",  // 18
    ]
    // let s=``; $(".choice-container label").siblings('input').each((_, e) => (s+=`"${$(e).attr('value')}",\n`)); console.log(s);
    const crimeMap = [
        [], // 0
        [], // 1
        [ // 2
            "searchtrainstation",
            "searchbridge",
            "searchbins",
            "searchfountain",
            "searchdumpster",
            "searchmovie",
        ],
        [ // 3
            "cdrock",
            "cdheavymetal",
            "cdpop",
            "cdrap",
            "cdreggae",
            "dvdhorror",
            "dvdaction",
            "dvdromance",
            "dvdsci",
            "dvdthriller",
        ],
        [ // 4
            "sweetshop",
            "marketstall",
            "clothesshop",
            "jewelryshop",
        ],
        [ // 5
            "hobo",
            "kid",
            "oldwoman",
            "businessman",
            "lawyer",
        ],
        [ // 6
            "apartment",
            "house",
            "mansion",
            "cartheft",
            "office",
        ],
        [ // 7
            "swiftrobbery",
            "thoroughrobbery",
            "swiftconvenient",
            "thoroughconvenient",
            "swiftbank",
            "thoroughbank",
            "swiftcar",
            "thoroughcar",
        ],
        [ // 8
            "cannabis",
            "amphetamines",
            "cocaine",
            "drugscanabis",
            "drugspills",
            "drugscocaine",
        ],
        [ // 9
            "simplevirus",
            "polymorphicvirus",
            "tunnelingvirus",
            "armoredvirus",
            "stealthvirus",
        ],
        [ // 10
            "assasination",
            "driveby",
            "carbomb",
            "murdermobboss",
        ],
        [ // 11
            "home",
            "Carlot",
            "OfficeBuilding",
            "aptbuilding",
            "warehouse",
            "motel",
            "govbuilding",
        ],
        [ // 12
            "parkedcar",
            "movingcar",
            "carshop",
        ],
        [ // 13
            "pawnshop",
            "pawnshopcash",
        ],
        [ // 14
            "makemoney2",
            "maketokens2",
            "makecard",
        ],
        [ // 15
            "napkid",
            "napwomen",
            "napcop",
            "napmayor",
        ],
        [ // 16
            "trafficbomb",
            "trafficarms",
        ],
        [ // 17
            "bombfactory",
            "bombbuilding",
        ],
        [ // 18
            "hackbank",
            "hackfbi",
        ]
    ];

    makeShortcuts();
})();