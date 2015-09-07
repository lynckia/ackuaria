
ACKUARIA_URL="" #HOST URL http://hostname:port/ackuaria

# DATE FORMAT: YYYY/DD/MM-hh/mm
DATE=`date +%Y-%m-%d:%H:%M:%S`
FILE_NAME="./reports/"$DATE"_report.json"
case "$1" in
	-g)
		TYPE="general"
	;;

	-d) TYPE="detailed"
	;;

	*)
		echo "          + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +"
		echo "          + Welcome to the help page of the Ackuaria Stats Script.    +"
		echo "          +                                                           +"
		echo "          + Commands:                                                 +"
		echo "          +                                                           +"
		echo "          +     . First Parameter: Level of detail                    +"
		echo "          +           -g       --> General information                +"
		echo "          +           -d       --> Add Detailed information by Room   +"
		echo "          +                                                           +"
		echo "          +     . Second Parameter: Query by dates                    +"
		echo "          +           -t                    --> Total information     +"
		echo "          +           -q INITDATE FINALDATE --> Between two dates     +"
		echo "          +           -i INITDATE           --> Since date            +"
		echo "          +           -f FINALDATE          --> Until date            +"
		echo "          +                                                           +"
		echo "          + Response format: JSON                                     +"
		echo "          + Dates format: DD/MM/YYYY-hh:mm                            +"
		echo "          + If you don't specificate any time, it will use 00:00      +"
		echo "          + Please, always use double digits for days, month and time +"
		echo "          +                                                           +"
		echo "          + Example: ./info_ackuaria.sh -d -i 01/07/2014-07:53        +"
		echo "          + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +"
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

esac


exit 0
