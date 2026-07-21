export const QUIZZES = {
  prof_lumen: [
    {
      q: 'Light travels from air (n=1.0) into water (n=1.33). What happens to the ray?',
      choices: ['It bends toward the normal', 'It bends away from the normal', 'It stops', 'Nothing changes'],
      answer: 0,
      explain: "Snell's Law: entering a higher-index medium always bends the ray toward the normal."
    },
    {
      q: 'Which material would make the most reflective mirror coating?',
      choices: ['Water', 'Silver', 'Polaroid film', 'Silicon'],
      answer: 1,
      explain: 'Silver reflects about 95% of visible light at normal incidence — the best common mirror coating.'
    },
    {
      q: 'A prism made of low-Abbe-number glass will...',
      choices: ['Barely split colors', 'Split colors a lot', 'Reflect all light', 'Absorb all light'],
      answer: 1,
      explain: 'Low Abbe number means refractive index varies a lot with wavelength — more color splitting.'
    },
    {
      q: 'Light travels from glass (n=1.5) into air (n=1.0). It bends...',
      choices: ['Away from the normal', 'Toward the normal', 'Not at all', 'Straight back the way it came'],
      answer: 0,
      explain: 'Leaving a denser medium for a less dense one bends the ray away from the normal — the mirror image of entering water.'
    },
    {
      q: 'At normal incidence, R = ((n1-n2)/(n1+n2))^2. Increasing the index difference between two media...',
      choices: ['Increases reflectivity', 'Decreases reflectivity', 'Has no effect', 'Only changes the color'],
      answer: 0,
      explain: 'A bigger index mismatch means a bigger fraction of light reflects at the boundary.'
    },
    {
      q: 'Which pair of materials reflects the LEAST light at their boundary?',
      choices: ['Air & water (1.0, 1.33)', 'Air & diamond (1.0, 2.42)', 'Air & silicon (1.0, 3.5)', 'Air & silver-coated glass'],
      answer: 0,
      explain: 'Air and water have the smallest index mismatch of the options, so the Fresnel reflectivity R is smallest.'
    },
    {
      q: 'A converging (biconvex) lens focuses parallel rays to a point because...',
      choices: [
        'It absorbs light unevenly',
        "Its curved surfaces bend rays via Snell's Law toward a common focus",
        'It reflects light like a mirror',
        'It polarizes incoming light'
      ],
      answer: 1,
      explain: "A lens is just two refracting surfaces shaped so Snell's Law bends every parallel ray to the same focal point."
    }
  ],
  prof_mirrors: [
    {
      q: 'What must be true for total internal reflection to occur?',
      choices: [
        'Light must go from lower to higher index',
        'Light must go from higher to lower index, beyond the critical angle',
        'The surface must be perfectly flat',
        'The light must be polarized'
      ],
      answer: 1,
      explain: 'TIR only happens going from denser to less-dense media, and only beyond θc = arcsin(n2/n1).'
    },
    {
      q: 'Polarizing sunglasses cut glare because reflected light off water is...',
      choices: ['Higher energy', 'Mostly one polarization near Brewster’s angle', 'Infrared', 'Diffracted'],
      answer: 1,
      explain: "Near Brewster's angle, reflected glare is strongly polarized in one plane, which a polarizer can block."
    },
    {
      q: 'A fiber-optic cable needs its core to have, compared to the cladding around it...',
      choices: ['A lower refractive index', 'A higher refractive index', 'The exact same index', 'No defined index'],
      answer: 1,
      explain: 'Light must travel from a denser core to a less-dense cladding for total internal reflection to guide it down the fiber.'
    },
    {
      q: 'Two polarizing filters are crossed at 90° to each other. How much light gets through?',
      choices: ['All of it', 'About half', 'Essentially none', 'Exactly double'],
      answer: 2,
      explain: "Malus's Law gives transmitted intensity proportional to cos²(angle between axes); at 90°, cos²(90°) = 0."
    },
    {
      q: "Diamond has an unusually small critical angle (~24°). This is because diamond has...",
      choices: ['A very high refractive index', 'Extreme hardness', 'High transparency', 'No color at all'],
      answer: 0,
      explain: 'Critical angle shrinks as index rises — diamond’s n≈2.42 traps light in repeated internal reflection, producing its sparkle.'
    },
    {
      q: 'The critical angle θc = arcsin(n2/n1) gets SMALLER when...',
      choices: ['The ratio n2/n1 gets smaller', 'The ratio n2/n1 gets larger', 'Wavelength increases', 'The surface gets rougher'],
      answer: 0,
      explain: 'A bigger index contrast between the two media (smaller n2/n1) shrinks the critical angle, making TIR easier to trigger.'
    }
  ],
  prof_labs: [
    {
      q: 'Why doesn’t a very bright red laser generate current in a silicon photodiode if red photons sit below the band gap?',
      choices: [
        'The laser isn’t focused enough',
        'Photon energy, not total brightness, decides if an electron gets freed',
        'Silicon reflects all red light',
        'Lasers can never be absorbed'
      ],
      answer: 1,
      explain: 'The photoelectric effect is a per-photon energy threshold (E=hf) — more low-energy photons still can’t cross the gap.'
    },
    {
      q: 'An achromatic doublet combines crown and flint glass to...',
      choices: ['Increase dispersion', 'Cancel chromatic aberration', 'Reflect more light', 'Polarize light'],
      answer: 1,
      explain: 'Pairing opposite-dispersion glasses cancels out the color fringing each one alone would cause.'
    },
    {
      q: 'According to E=hf, which carries more energy per photon?',
      choices: ['A red photon', 'A blue photon', 'They always carry equal energy', 'It depends on brightness, not color'],
      answer: 1,
      explain: 'Photon energy scales with frequency; blue light has higher frequency than red, so each blue photon carries more energy.'
    },
    {
      q: 'Silicon has a band gap of about 1.1 eV. Infrared photons carrying only 0.8 eV each strike it. What happens?',
      choices: [
        'They generate full photocurrent',
        'They generate essentially no photocurrent from this effect',
        'They generate double the current',
        'They get converted into visible light'
      ],
      answer: 1,
      explain: "Photons below the band gap energy can't free an electron, no matter how many of them arrive — a threshold effect."
    },
    {
      q: 'Increasing the BRIGHTNESS (not the color) of light that sits below a material’s band gap will...',
      choices: [
        'Eventually trigger the photoelectric effect if it’s bright enough',
        'Never trigger it, no matter how bright',
        'Only work if focused through a lens',
        'Only work at night'
      ],
      answer: 1,
      explain: 'Brightness raises photon COUNT, not photon ENERGY — an underpowered photon is still underpowered no matter how many arrive.'
    },
    {
      q: 'Why do camera sensors and solar panels often use different semiconductor band gaps?',
      choices: [
        'Band gap has no effect on function',
        'A band gap sets the minimum photon energy the material can absorb, tuning which colors it responds to',
        'Wider band gaps are always strictly better',
        'Band gap only affects the material’s own visible color'
      ],
      answer: 1,
      explain: "A material's band gap sets a minimum photon energy for absorption, effectively tuning which part of the spectrum it responds to."
    }
  ]
};
