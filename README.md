<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./logo-dark.png" />
    <source media="(prefers-color-scheme: light)" srcset="./logo-light.png" />
    <img width="400" alt="Ttyrec Player" src="./logo-light.png" />
  </picture>
</p>

<div align="center">
  <img src="./screenshot.png" alt="Ttyrec Player" />
</div>

A ttyrec player with some additional features. Uses [Asciinema Player](https://github.com/asciinema/asciinema-player) as the core player.

Primarily developed for Dungeon Crawl Stone Soup playback, but should support all other ttyrec files as well.

## Features

- [x] Play .ttyrec and .ttyrec.bz2 files
- [x] Playlist
- [x] Search (supports regular expressions)
- [x] Merge multiple ttyrecs (works even when ttyrec and ttyrec.bz2 files are mixed)
- [x] i18n - Korean, English
- [x] Cache bz2 unzipped results

### Search

<table border="0">
  <tr>
    <td>
      <img src="./search.png" alt="Search" />
    </td>
    <td>
      <img src="./search-regex.png" alt="Search" />
    </td>
  </tr>
</table>

- Currently case-insensitive.
- Clicking on search results jumps to the corresponding timestamp.
  - There may be a slight timing discrepancy of a few frames. Asciinema Player provides millisecond-level seeking, while ttyrec records down to microseconds. If text doesn't appear after clicking search results, use `,`, `.` keys to navigate through nearby frames.
- Text that appears in the actual game screen may not be searchable. ttyrec sometimes updates only necessary parts of the text. For example, if an Oni worships Gozag and becomes "Oni the Gozag", it moves the cursor after "Oni" and adds "the Gozag". In this case, `the Gozag` is searchable but `Oni the Gozag` is not. However, in most cases, you can search for the desired text directly.

### Merge

### More to do

### Inspired by

CNC server's ttyrec player (examples - go to https://archive.nemelex.cards/ttyrec/caiman and click "Play" button)
