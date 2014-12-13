#!/bin/bash
cmd=(dialog --separate-output --checklist "Build Swifty plugin:" 22 76 16)
# any option can be set to default to "on"
options=(1 "Pull all masters" off
         2 "Merge all develops" off
         3 "Build DIST version" on
         4 "Build PRO version" off
         5 "Test" off
         6 "Send email" off
         7 "SVN update" off
         8 "SVN submit" off
         9 "Release on swiftylife.com" off
         a "Commit and tag" off)
choices=$("${cmd[@]}" "${options[@]}" 2>&1 >/dev/tty)
clear
startgruntcmd="from_dialog_do"
gruntcmd=$startgruntcmd
for choice in $choices
do
    case $choice in
        1)
            sss="_pullall"
            gruntcmd=$gruntcmd$sss
            ;;
        2)
            sss="_mergedev"
            gruntcmd=$gruntcmd$sss
            ;;
        3)
            sss="_dist"
            gruntcmd=$gruntcmd$sss
            ;;
        4)
            sss="_pro"
            gruntcmd=$gruntcmd$sss
            ;;
        5)
            sss="_test"
            gruntcmd=$gruntcmd$sss
            ;;
        6)
            sss="_mail"
            gruntcmd=$gruntcmd$sss
            ;;
        7)
            sss="_svnupdate"
            gruntcmd=$gruntcmd$sss
            ;;
        8)
            sss="_svnsubmit"
            gruntcmd=$gruntcmd$sss
            ;;
        9)
            sss="_releaseswiftylife"
            gruntcmd=$gruntcmd$sss
            ;;
        a)
            sss="_commitandtag"
            gruntcmd=$gruntcmd$sss
            ;;
    esac
done
if [ "$gruntcmd" != "$startgruntcmd" ]
then
    echo "#"
    echo "# grunt $gruntcmd"
    echo "#"
    bash -c "grunt $gruntcmd"
fi