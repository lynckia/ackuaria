
ACKUARIA_URL=""
# FORMAT: YYYY/DD/MM-hh/mm

case "$1" in 
	-help)
		echo "          + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +"
		echo "          + Welcome to the help page of the Ackuaria Stats Script.  +"
		echo "          +                                                         +"
		echo "          + Commands:                                               +"
		echo "          +     -total                                              +"
		echo "          +     -query INITDATE FINALDATE                           +"
		echo "          +     -init INITDATE                                      +"
		echo "          +     -final FINALDATE                                    +"
		echo "          +                                                         +"
		echo "          + Response format: JSON                                   +"
		echo "          + Dates format: DD/MM/YYYY-hh:mm                          +"
		echo "          + If you don't specificate any time, it will use 00:00    +"
		echo "          + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +"


	;;
	-total)
		echo "Showing total info"
		URL="http://poochie.dit.upm.es:8888/ackuaria/info"
		curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL"
	;;
	-query)
		echo "Showing info query between specified dates..."
		init="$2"
		final="$3"
		INITTIME=$(echo "$init" | sed 's%/%%g;s%-%%g;s%:%%g')
		FINALTIME=$(echo "$final" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info?init="$INITTIME"?final="$FINALTIME""
		curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL"

	;;
	-init) 
		echo "Showing info query since date..."
		init="$2"
		INITTIME=$(echo "$init" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info?init="$INITTIME""
		curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL"

	;;
	-final)
		echo "Showing info query until date..."
		final="$2"
		FINALTIME=$(echo "$final" | sed 's%/%%g;s%-%%g;s%:%%g')
		URL=""$ACKUARIA_URL"/info?final="$FINALTIME""
		curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET "$URL"

	;;

esac


exit 0
