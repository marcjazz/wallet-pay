import { TextField, MenuItem } from "@mui/material";
import { useLanguage } from "@xafpay/theme";
import { SupportedLanguageEnum } from "@xafpay/types";
import { useIntl } from "react-intl";

export function LanguageSwapper() {
    const { activeLanguage, languageDispatch } = useLanguage()
    const { formatMessage } = useIntl()
    return (
        <TextField
            size="small"
            select
            value={activeLanguage}
            onChange={() =>
                languageDispatch({
                    type: activeLanguage === 'Fr' ? 'USE_ENGLISH' : 'USE_FRENCH'
                })
            }
            sx={{
                '&.MuiFormControl-root': {
                    background: 'transparent',
                },
                '& .MuiInputBase-root': {
                    background: 'transparent',
                    paddingRight: '0px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none !important'
                },
                '& .MuiSelect-select': {
                    fontFamily: 'Poppins',
                    color: '#2F3A45',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    height: 'fit-content',
                },
            }}
        >
            {Object.entries(SupportedLanguageEnum).map(([key, value]) => (
                <MenuItem
                    dense
                    key={key}
                    value={key}
                >
                    <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${key === 'En' ? 'gb' : key.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${key === 'En' ? 'gb' : key.toLowerCase()}.png 2x`}
                        alt=""
                        style={{ marginRight: '10px' }}
                    />
                    {formatMessage({ id: value.toLowerCase() })}
                </MenuItem>
            ))}
        </TextField>
    );
}