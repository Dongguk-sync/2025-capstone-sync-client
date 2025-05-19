import { useState } from 'react'
import Switch from 'react-switch'

export default function OnOffToggle() {
    const [checked, setChecked] = useState(false)
    return (
        <label>
        <Switch
            checked={checked}
            onChange={setChecked}
            onColor="#86d3ff"
            offColor="#888"
            uncheckedIcon={false}
            checkedIcon={false}
            height={16}
            width={32}
            handleDiameter={10}
        />
        </label>
  )
}