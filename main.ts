/**
 *  MCP23017-Interfacefunktionen für LEDs
 */
// Basierend auf der tollen Grundlagenseite 
// http://robert-fromm.info/?post=elec_i2c_calliope
// (cc) Creative Commons Robert Fromm 2017
// Als Makecode / pxt-Paket 28.07.2019 M. Klein v0.9

const enum State {
    //% block="On"
    High = 1,
    //% block="Off"
    Low = 0
}

const enum REG_MCP {
    //% Bitmuster um Register A zu beschreiben
    Bitmuster_A = 0x12,
    //% Bitmuster um Register B zu beschreiben
    Bitmuster_B = 0x13,
    //% Aus- / Eingaberichtung des Registers A
    EinOderAusgabe_A = 0x00, //Register stehen standardmäßig auf Eingabe (1111 1111)
    //% Aus- / Eingaberichtung des Registers B
    EinOderAusgabe_B = 0x01,
    //% Pullup Widerstände Register A
    PullUp_Widerstaende_A = 0x0C,
    //% Pullup Widerstände Register B
    PullUp_Widerstaende_B = 0x0D
}

const enum ADDRESS {                // Adresse des MCP23017
    //% block=0x20
    A20 = 0x20,               // Standardwert
    //% block=0x21
    A21 = 0x21,               // 
    //% block=0x22
    A22 = 0x22,               // 
    //% block=0x23
    A23 = 0x23,               // 
    //% block=0x24
    A24 = 0x24,               // 
    //% block=0x25
    A25 = 0x25,               // 
    //% block=0x26
    A26 = 0x26,               // 
    //% block=0x27
    A27 = 0x27                // 
}
const enum BITS {                    //
    //% block=11111111
    Alle = 0xff,               // 
    //% block=00000000
    keiner = 0x00,             // 
    //% block=00000001
    Bit1 = 0x01,               // 
    //% block=00000010
    Bit2 = 0x02,               // 
    //% block=00000100
    Bit3 = 0x04,               // 
    //% block=00001000
    Bit4 = 0x08,               // 
    //% block=00010000
    Bit5 = 0x10,               // 
    //% block=00100000
    Bit6 = 0x20,                // 
    //% block=01000000
    Bit7 = 0x40,                // 
    //% block=10000000
    Bit8 = 0x80                 // 

}

// zum Speichern der Bitwerte aus RegisterA und RegisterB

let BitwertA = 0;
let BitwertB = 0;

//% weight=100 color=#0fbc11 icon="\uf2db"
//% groups=["LEDs", "On Start"]

namespace MCP23017 {

    /**
     * Sets the Registers of the MCP23017 to write 
     * and the pull-ups to high
     */
    //% blockId="initMCP23017LED"
    //% block="program the MCP23017 for LEDs"
    //% weight=80
    //% group="On Start"
    export function initMCP23017LED(): void {
        // Alle Register auf Ausgabe stellen
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_A, MCP23017.bitwert(BITS.keiner))
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_B, MCP23017.bitwert(BITS.keiner))
        // Pullup-Widerständ für saubere Signalübertragung ein!
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_A, MCP23017.bitwert(BITS.Alle))
        MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_B, MCP23017.bitwert(BITS.Alle))
    }

    /**
     * Schaltet alle LEDs an oder aus.
     * MCP23017 muss vorher für LEDs programmiert sein.
     * @param level digital pin level, either 0 or 1
     */
    //% blockId="setLeds"
    //% block="turn all LEDs %zustand"
    //% weight=87
    //% group="LEDs"
    export function setLeds(zustand: State): void {
        for (let i = 1; i <= 16; i++) {
            setLed(i, zustand);
        }
    }

    /**
     * Schaltet eine LED an oder aus. 
     * MCP23017 muss vorher für LEDs programmiert sein.
     * @param name name of the pin in the range from 1 to 16, eg: 1
     * @param zustand state, either ON or OFF
     */
    //% blockId="setLed"
    //% block="turn LED %name | %zustand"
    //% name.min=1 name.max=16
    //% weight=88
    //% group="LEDs"

    export function setLed(name: number, zustand: State): void {
        if (name < 1 || name > 16) {
            return;
        }
        if (zustand == State.High) { //LEDs an
            if (name > 0 && name < 9) { // Register A
                // Bitweises oder
                BitwertA = BitwertA | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
            } else { // Register B
                name = name - 8
                BitwertB = BitwertB | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
            }
        } else { //   LEDs aus
            if (name > 0 && name < 9) { // Register A
                // Ist das betreffende Bit gesetzt? Dann löschen
                if ((BitwertA & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    // Bitweises XOR ^
                    BitwertA = BitwertA ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
                }
            } else { // Register B
                name = name - 8
                if ((BitwertB & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    // Bitweises XOR ^
                    BitwertB = BitwertB ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
                }
            }
        }

    }

    /**
     * Schreibt in ein Register einen bestimmten Bitwert
     * addr: Adresse des MCP23017 (Standard 0x20)
     * reg: Register
     * value: Bitmuster als Dezimalzahl
     */
    //% blockId=Schreiberegister advanced=true block="Beschreibe an Adresse %addr|das Register %reg|mit dem Wert %value"
    export function writeRegister(addr: ADDRESS, reg: REG_MCP, value: number) {
        pins.i2cWriteNumber(addr, reg * 256 + value, NumberFormat.UInt16BE)
    }

    /**
     * Liest aus Register einen bestimmten Bitwert,
     * verknüpft ihn mit einem Bitmuster und gibt 
     * "Wahr" zurück wenn die Bits gesetzt sind.
     * addr: Adresse des MCP23017 (Standard 0x20)
     * reg: Register
     * value: Bitmuster als Dezimalzahl
     * return: wahr oder falsch
     */

    //% blockId=LiesRegisterNAND advanced=true
    //% block="Lies von Adresse %addr|das Register %reg|und verknüpfe es mit Bitwert %value"
    export function ReadNotAnd(addr: ADDRESS, reg: REG_MCP, value: number): boolean {
        return (!(MCP23017.readRegister(addr, reg) & value))
    }

    /**
     * Bitwert für  alle Ein- bzw. Ausgänge zum auswählen
     */
    //% blockId=alle block="%alle"
    //% advanced=true
    export function bitwert(alle: BITS): number {
        return alle
    }

    //% blockId=LiesRegister 
    //% advanced=true block="Lies von Adresse %addr|das Register %reg| aus"
    export function readRegister(addr: ADDRESS, reg: REG_MCP): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.Int8LE);
        return pins.i2cReadNumber(addr, NumberFormat.Int8LE)
    }
}