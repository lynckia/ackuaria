#!/bin/bash

ACKUARIA_URL="" #HOST URL http://hostname:port/ackuaria

# DATE FORMAT: YYYY/DD/MM-hh/mm
DATE=`date +%Y%m%d%H%M%S`

SCRIPT=`pwd`/$0
PATHNAME=`dirname $SCRIPT`
ROOT=$PATHNAME/..
REPORT_DIR=$ROOT/reports/
FILE_NAME=$REPORT_DIR$DATE"_report.json"


usage() 
{
cat << EOF

        + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
        + Welcome to the help page of the Ackuaria Stats Script.    +
        +                                                           +
        + Commands:                                                 +
        +                                                           +
        +     . First Parameter: Level of detail                    +
        +           -g       --> General information                +
        +           -d       --> Add Detailed information by Room   +
        +                                                           +
        +     . Second Parameter: Query by dates                    +
        +           -t                    --> Total information     +
        +           -q INITDATE FINALDATE --> Between two dates     +
        +           -i INITDATE           --> Since date            +
        +           -f FINALDATE          --> Until date            +
        +                                                           +
        + Response format: JSON                                     +
        + Dates format: DD/MM/YYYY-hh:mm                            +
        + If you dont specificate any time, 00:00 will be used      +
        + Please, always use double digits for days, month and time +
        +                                                           +
        + Example: ./info_ackuaria.sh -d -i 01/07/2014-07:53        +
        + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +


EOF
}

case "$1" in
	-g)
		TYPE="general"
	;;

	-d) TYPE="detailed"
	;;

	*) usage
	
	;;
esac

case "$2" in 

	-t)
		echo "Showing total info"
		URL=""$ACKUARIA_URL"/info/"$TYPE""
		json_resp=$(curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL")
		echo "$json_resp" >> "$FILE_NAME"
	;;
	-q)
		echo "Showing info query between specified dates..."
		init="$3"
		final="$4"
		INITTIME=$(echo "$init" | sed 's%/%%g;s%-%%g;s%:%%g')
		FINALTIME=$(echo "$final" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info/"$TYPE"?init="$INITTIME"&final="$FINALTIME""
		json_resp=$(curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL")
		echo "$json_resp" >> "$FILE_NAME"

	;;
	-i) 
		echo "Showing info query since date..."
		init="$3"
		INITTIME=$(echo "$init" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info/"$TYPE"?init="$INITTIME""
		json_resp=$(curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL")
		echo "$json_resp" >> "$FILE_NAME"

	;;
	-f)
		echo "Showing info query until date..."
		final="$3"
		FINALTIME=$(echo "$final" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info/"$TYPE"?final="$FINALTIME""
		json_resp=$(curl -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL")
		echo "$json_resp" >> "$FILE_NAME"

	;;

	*) echo "        Error: Please, specify the second parameter"
	   usage
	   ;;

esac


exit 0
