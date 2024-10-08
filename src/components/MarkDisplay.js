import {getSetting} from "../utils/settingsManager";

/**
 * Display a mark
 * @param mark {Number}
 * @param showDecimal
 * @constructor
 */
export default function MarkDisplay(mark, showDecimal = true) {
    const fixedMark = mark.toFixed(2)
    return (
        <span>
            {fixedMark.split('.')[0]}
            {showDecimal &&
                (<><span style={{fontSize: getSetting('interface.smallerdecimal') ? 'smaller' : ''}}>.{fixedMark.split('.')[1]}
                    {getSetting('interface.showpercent') ? '%' : ''}
                </span></>)
            }
        </span>
    );
}