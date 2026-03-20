"use client"
import { useEffect } from 'react';

interface ColorPickerProps {
    color: string
}

function hexToRgb(hex: string) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
        c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

// Helper: Convert RGB to Lab
// Reference: https://www.easyrgb.com/en/math.php
function rgbToLab({ r, g, b }: { r: number, g: number, b: number }) {
    // Convert RGB to [0,1]
    r /= 255; g /= 255; b /= 255;

    // sRGB to Linear RGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Linear RGB to XYZ
    let x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Normalize for D65 white point
    x /= 0.95047;
    y /= 1.00000;
    z /= 1.08883;

    // XYZ to Lab
    const epsilon = 216 / 24389;
    const kappa = 24389 / 27;

    function f(t: number) {
        return t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116;
    }

    const fx = f(x);
    const fy = f(y);
    const fz = f(z);

    const L = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b_ = 200 * (fy - fz);

    return {
        L: L,
        a: a,
        b: b_
    };
}

export default function PrimarySwitcher({ color }: ColorPickerProps) {
    useEffect(() => {
        if (!color || !color.startsWith('#')) return;
        const rgb = hexToRgb(color);
        const lab = rgbToLab(rgb);

        const L = Math.max(0, Math.min(100, lab.L)).toFixed(4) + '%';
        const a = lab.a.toFixed(5);
        const b_ = lab.b.toFixed(5);

        const labString = `lab(${L} ${a} ${b_})`;

        document.documentElement.style.setProperty('--color-primary', labString);
        document.documentElement.style.setProperty('--primary', labString);
    }, [color]);

    return null;
}
