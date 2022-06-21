import type {FlashType} from './flashOptions';
import type {WeatherType} from './weatherOptions';
import type {AnimalSpecies} from "./animalSpecies";
import type {DogsSpecies} from "./dogsSpecies";
import type {Color} from "./color"
import type {UnitType} from "./unitType";
import type {FacesTypes} from "./FacesTypes";

function notEmptyString(value: string): string {
    if (value.length === 0) return undefined;
    return value;
}

function notNullNumber(value: number): number {
    if (value === null) return undefined;
    return value;
}

function notEmptyDate(value: string): Date {
    if (value.length === 0) return undefined;
    return new Date(value);
}

function notEmptyHex(value: string): number {
    const parsed = parseInt(value, 16);
    if (isNaN(parsed)) return undefined;
    return parsed;
}

function notEmptyColor(value: Color): Color{
    return (value.map(v=>v?v:0)) as Color
}

export abstract class AbstractModuleConfig {
    _active: boolean;
    name: string;

    get active() {
        return this._active;
    }

    abstract get allConfig(): Record<string, any> & { name: string };

    constructor(name) {
        this._active = false;
        this.name = name;
    }
}

export class FormRange {
    min: number;
    max: number;

    clamp(property: keyof FormRange, value: number) {
        if (Number.isNaN(value)) {
            value = null;
        }
        switch (property) {
            case 'min':
                if (this.max === null || value === null) this.min = value;
                else this.min = Math.min(value, this.max);
                break;
            case 'max':
                if (this.min === null || value === null) this.max = value;
                else this.max = Math.max(value, this.min);
                break;
        }
        return this[property];
    }

    constructor() {
        this.min = null;
        this.max = null;
    }
}

class MetadataModuleConfig extends AbstractModuleConfig {
    _dateAfter: string;
    get dateAfter() {
        return notEmptyDate(this._dateAfter);
    }

    _dateBefore: string;
    get dateBefore() {
        return notEmptyDate(this._dateBefore);
    }

    _flash: FlashType | '';
    get flash() {
        return notEmptyHex(this._flash);
    }

    _fNumber: number;
    get fNumber() {
        return notNullNumber(this._fNumber);
    }

    _focalLength: number;
    get focalLength() {
        return notNullNumber(this._focalLength);
    }

    _exposureTime: number;
    get exposureTime() {
        return notNullNumber(this._exposureTime);
    }

    _pixelXDim: FormRange;
    _pixelYDim: FormRange;

    get pixelXDimMax() {
        return notNullNumber(this._pixelXDim.max);
    }

    get pixelXDimMin() {
        return notNullNumber(this._pixelXDim.min);
    }

    get pixelYDimMax() {
        return notNullNumber(this._pixelYDim.max);
    }

    get pixelYDimMin() {
        return notNullNumber(this._pixelYDim.min);
    }

    get allConfig() {
        const {
            name,
            dateAfter,
            dateBefore,
            flash,
            fNumber,
            focalLength,
            exposureTime,
            pixelXDimMin,
            pixelXDimMax,
            pixelYDimMin,
            pixelYDimMax,
        } = this;
        const obj = {
            name,
            dateAfter,
            dateBefore,
            flash,
            fNumber,
            focalLength,
            exposureTime,
            pixelXDimMin,
            pixelXDimMax,
            pixelYDimMin,
            pixelYDimMax,
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('metadata');
        this._dateAfter = '';
        this._dateBefore = '';
        this._flash = '';
        this._fNumber = null;
        this._focalLength = null;
        this._exposureTime = null;
        this._pixelXDim = new FormRange();
        this._pixelYDim = new FormRange();
    }
}

export function isMetadataConfig(config: AbstractModuleConfig): config is MetadataModuleConfig {
    return config.name === 'metadata';
}

class TextModuleConfig extends AbstractModuleConfig {
    _hasText: boolean;
    get hasText() {
        return this._hasText;
    }

    _length: FormRange;

    get maxLength() {
        return notNullNumber(this._length.max);
    }

    get minLength() {
        return notNullNumber(this._length.min);
    }

    _containsText: string;
    get containsText() {
        return notEmptyString(this._containsText);
    }

    get allConfig() {
        const {name, hasText, maxLength, minLength, containsText} = this;
        const obj = {
            name,
            hasText,
            ...(hasText && {
                maxLength,
                minLength,
                containsText,
            }),
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('text');
        this._hasText = false;
        this._containsText = '';
        this._length = new FormRange();
    }
}

export function isTextConfig(config: AbstractModuleConfig): config is TextModuleConfig {
    return config.name === 'text';
}

class WeatherModuleConfig extends AbstractModuleConfig {
    _weather_type: WeatherType;

    get weatherType() {
        return notEmptyString(this._weather_type);
    }

    _precision: number;
    get precision() {
        return notNullNumber(this._precision);
    }

    get allConfig() {
        const {name, weatherType, precision} = this;
        const obj = {name, weatherType, precision};
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('weather');
        this._weather_type = 'clear';
        this._precision = null;
    }
}

export function isWeatherConfig(config: AbstractModuleConfig): config is WeatherModuleConfig {
    return config.name === 'weather';
}

class PeopleModuleConfig extends AbstractModuleConfig {
    _hasPeople: boolean;
    get hasPeople() {
        return this._hasPeople;
    }

    _count: FormRange;

    get minPeople() {
        return notNullNumber(this._count.min);
    }

    get maxPeople() {
        return notNullNumber(this._count.max);
    }

    get allConfig() {
        const {name, hasPeople, minPeople, maxPeople} = this;
        const obj = {
            name,
            hasPeople,
            ...(hasPeople && {
                minPeople,
                maxPeople,
            }),
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('people');
        this._hasPeople = false;
        this._count = new FormRange();
    }
}

export function isPeopleConfig(config: AbstractModuleConfig): config is PeopleModuleConfig {
    return config.name === 'people';
}

class FormatModuleConfig extends AbstractModuleConfig {
    allFormats = [
        ".jpeg", ".jpeg2000", ".gif", ".bmp", ".png",
        ".webp", ".ico", ".img", ".xcf", ".cgm", ".svg",
        ".blend", ".xaml", ".pdf", ".jpg"
    ];
    _selectedFormats: string[];

    get allConfig() {
        const {name, _selectedFormats} = this;
        const obj = {
            name,
            _selectedFormats,
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('format');
        this._selectedFormats = [];
    }
}

export function isFormatConfig(config: AbstractModuleConfig): config is FormatModuleConfig {
    return config.name === 'format';
}

class StyleModuleConfig extends AbstractModuleConfig {
    allTypes = [
        "photo", "clip art", "line drawing"
    ];
    _selectedTypes: string[];

    get allConfig() {
        const {name, _selectedTypes} = this;
        const obj = {
            name,
            _selectedTypes,
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('style');
        this._selectedTypes = [];
    }
}

export function isStyleConfig(config: AbstractModuleConfig): config is StyleModuleConfig {
    return config.name === 'style';
}

class BodyModuleConfig extends AbstractModuleConfig {
    faceChecked: boolean;
    _faceConfidence: number;
    get faceConfidence() {
        return notNullNumber(this._faceConfidence);
    }

    handsChecked: boolean;
    _handsConfidence: number;
    get handsConfidence() {
        return notNullNumber(this._handsConfidence);
    }

    get allConfig() {
        const {name, faceChecked, faceConfidence, handsChecked, handsConfidence} = this;
        const obj = {
            name,
            faceChecked,
            ...(faceChecked && {
                faceConfidence,
            }),
            handsChecked,
            ...(handsChecked && {
                handsConfidence,
            }),
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('body');
        this.faceChecked = false;
        this.handsChecked = false;
    }
}

export function isBodyConfig(config: AbstractModuleConfig): config is BodyModuleConfig {
    return config.name === 'body';
}

class AnimalModuleConfig extends AbstractModuleConfig {
    _animalSpecies: AnimalSpecies;
    get animalSpecies() {
        return notEmptyString(this._animalSpecies);
    }

    _confidence: number;
    get confidence() {
        return notNullNumber(this._confidence);
    }

    get allConfig() {
        const {name, animalSpecies, confidence} = this;
        const obj = {name, animalSpecies, confidence};
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('animal');
        this._animalSpecies = 'tiger';
        this._confidence = null;
    }
}

export function isAnimalConfig(config: AbstractModuleConfig): config is AnimalModuleConfig {
    return config.name === 'animal';
}

class ThingsModuleConfig extends AbstractModuleConfig {
    imagePath: string;
    pathValid: boolean;

    checkIfValid = (e: Event) => {
        const re =
            /^(\/.*|[a-zA-Z]:[\\/](?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]|..[\\/])*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]?|..[\\/]))?)$/;
        this.pathValid = re.test((e.target as HTMLInputElement).value);
    }

    get allConfig() {
        const {name, imagePath, pathValid} = this;
        const obj = {
            name,
            ...(pathValid && {
                imagePath,
            }),
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('things');
        this.imagePath = '';
        this.pathValid = true;
    }
}

export function isThingsConfig(config: AbstractModuleConfig): config is ThingsModuleConfig {
    return config.name === 'things';
}

class SimilaritiesModuleConfig extends AbstractModuleConfig {
    imagePath: string;
    pathValid: boolean;
    confidence: number

    checkIfValid = (e: Event) => {
        const re =
            /^(\/.*|[a-zA-Z]:[\\/](?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]|..[\\/])*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]?|..[\\/]))?)$/;
        this.pathValid = re.test((e.target as HTMLInputElement).value);
    }

    get allConfig() {
        const {name, confidence, imagePath, pathValid} = this;
        const obj = {
            name,
            ...(pathValid && {
                imagePath,
                confidence
            }),
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('similarities');
        this.imagePath = '';
        this.pathValid = true;
        this.confidence = 50;
    }
}

export function isSimilaritiesConfig(config: AbstractModuleConfig): config is SimilaritiesModuleConfig {
    return config.name === 'similarities';
}

class DogsModuleConfig extends AbstractModuleConfig {
    _dogSpecies: DogsSpecies;

    get dogsSpecies() {
        return notEmptyString(this._dogSpecies);
    }

    get allConfig() {
        const {name, dogsSpecies} = this;
        const obj = {name, dogsSpecies: dogsSpecies};
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('dogs');
        this._dogSpecies = 'corgi';
    }
}

export function isDogsConfig(config: AbstractModuleConfig): config is DogsModuleConfig {
    return config.name === 'dogs';
}


class SizeModuleConfig extends AbstractModuleConfig {
    _pixels: [number, number];
    get pixels() {
        return this._pixels;
    }

    _cm: [number, number];
    get cm() {
        return this._cm;
    }

    _unit: UnitType;
    get unit() {
        return this._unit;
    }

    _kb: number;
    get kb() {
        return notNullNumber(this._kb);
    }

    _comparator: string;
    get comparator() {
        return notEmptyString(this._comparator);
    }

    _threshold: number;
    get threshold() {
        return notNullNumber(this._threshold);
    }

    get allConfig() {
        const {
            name,
            unit,
            kb,
            cm,
            pixels,
            comparator,
            threshold,

        } = this;
        const obj = {
            name,
            unit,
            kb,
            cm,
            pixels,
            comparator,
            threshold,
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('size');
        this._pixels = [null, null];
        this._cm = [null, null];
        this._unit = '';
        this._kb = null;
        this._comparator = null;
        this._threshold = null;
    }
}

export function isSizeConfig(config: AbstractModuleConfig): config is SizeModuleConfig {
    return config.name === 'size';
}

class FacesModuleConfig extends AbstractModuleConfig {
    _type: FacesTypes;

    get type() {
        return this._type;
    }

    _noFaces: number;
    get noFaces() {
        return this._noFaces;
    }

    _noSmiles: number;
    get noSmiles() {
        return this._noSmiles;
    }

    _comparator: string;
    get comparator() {
        return notEmptyString(this._comparator);
    }

    _threshold: number;
    get threshold() {
        return notNullNumber(this._threshold);
    }

    get allConfig() {
        const {
            name,
            type,
            noFaces,
            noSmiles,
            comparator,
            threshold,

        } = this;
        const obj = {
            name,
            type,
            noFaces,
            noSmiles,
            comparator,
            threshold,
        };
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj;
    }

    constructor() {
        super('faces');
        this._type = "faces";
        this._noFaces = null;
        this._noSmiles = null;
        this._comparator = null;
        this._threshold = null;
    }
}

export function isFacesConfig(config: AbstractModuleConfig): config is FacesModuleConfig {
    return config.name === 'faces';
}


class ColorsModuleConfig extends AbstractModuleConfig {
    _color: string
    _metric: number
    _comparator: string
    _threshold: number
    _percent_threshold: number
    _tolerance: number

    get color(){
        return notEmptyString(this._color)
    }
    get metric(){
        const v = notNullNumber(this._metric)
        return v?v:1
    }

    get comparator(){
        const v = notEmptyString(this._comparator)
        return v?v:"mean"
    }

    get threshold(){
        return notNullNumber(this._threshold)
    }

    get percent_threshold(){
        return notNullNumber(this._percent_threshold)
    }

    get tolerance(){
        return notNullNumber(this._tolerance)
    }


    get allConfig(){
        const {name, color, metric, comparator, threshold, percent_threshold, tolerance} = this;
        const obj = { name, color, metric, comparator, threshold, percent_threshold, tolerance }
        Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
        return obj
    }
    constructor(){
        super('colors')
        this._color = "#ff0000"
        this._metric = 3
        this._comparator = '=='
        this._threshold = 10
        this._percent_threshold = 10
        this._tolerance = 10
    }
}

export function isColorsConfig(config: AbstractModuleConfig): config is ColorsModuleConfig {
    return config.name === 'colors';
}

const array = [
    ['text', new TextModuleConfig()],
    ['metadata', new MetadataModuleConfig()],
    ['weather', new WeatherModuleConfig()],
    ['people', new PeopleModuleConfig()],
    ['format', new FormatModuleConfig()],
    ['style', new StyleModuleConfig()],
    ['body', new BodyModuleConfig()],
    ['animal', new AnimalModuleConfig()],
    ['things', new ThingsModuleConfig()],
    ['dogs', new DogsModuleConfig()],
    ['similarities', new SimilaritiesModuleConfig()],
    ['size', new SizeModuleConfig()],
    ['faces', new FacesModuleConfig()],
    ['colors', new ColorsModuleConfig()],
    /*
    ['another module', new AnotherModuleConfig()],
    */
] as [string, AbstractModuleConfig][];
export default array.reduce((acc, [name, config]) => {
    acc[name] = config;
    return acc;
}, {} as Record<string, AbstractModuleConfig>);
