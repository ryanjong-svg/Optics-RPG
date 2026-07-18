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
    }
  ]
};
