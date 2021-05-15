# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add Row item for pages
- Add validation for page inputs using CSS

### Changed
- Hide flags if parameter is in progress
- Show run button if required arguments are met
- Show form button if command has run function & arguments

## [0.7.2] - 2021-05-14
## Added
- Long text item for Pages
- Rerun button (experimental)

## Changed
- Scope all previously global styles
- Use `required` instead of `isArg` for all related states
- Show `*` next to required arguments in Dropdown

## [0.7.1] - 2021-05-14
### Added
- Add presets for pages
- Add reset button in Page button row

### Changed
- Use `name` for button, not `value`

### Fixed
- Fix selecting flags
- Fix flexbox issue
- Fix parser not skipping space or invalid tokens
- Use `.trim()` when storing items to History
- Fix mutability of args in Pages

## [0.7.0 (Alpha)] - 2021-05-09
### Added
- Add history system

### Changed
- Fully integrate pages, forms, and run functions
- Update help command (`help`)

## [0.6.0] - 2021-05-08
### Added
- Styled page items

### Changed
- Page rendering (simple)

### Fixed
- Fix toast system and a few functions

## [0.5.0] - 2021-05-07
### Added
- Add pages (basic)

### Changed
- Refactor command setup
  - Change `Command.description` to `Command.desc`
- Major style updates

### Fixed
- Squash a few bugs

## [0.4.0] - 2021-05-03
### Added
- Add typescript

## [0.3.0] - 2021-04-26
### Added
- Add toast system
- Add selection system (dropdown)
- Add README