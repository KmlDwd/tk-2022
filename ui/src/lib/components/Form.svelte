<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import {slide} from 'svelte/transition';
    import {animalSpecies} from '../utils/animalSpecies';
    import {flashOptions} from '../utils/flashOptions';
    import {weatherOptions} from '../utils/weatherOptions';
    import {comparatorType} from '../utils/comparatorType';
    import {colorMetrics} from '../utils/colorMetrics';
    import formConfigMap, {
        FormRange,
        isAnimalConfig,
        isBodyConfig,
        isColorsConfig,
        isDogsConfig,
        isFacesConfig,
        isFormatConfig,
        isMetadataConfig,
        isPeopleConfig,
        isSimilaritiesConfig,
        isSizeConfig,
        isStyleConfig,
        isTextConfig,
        isThingsConfig,
        isWeatherConfig
    } from '../utils/moduleFormConfig';
    import {dogsSpecies} from "../utils/dogsSpecies";
    import {unitType} from "../utils/unitType";
    import {facesTypes} from "../utils/FacesTypes";

    export let searching = false;

    const modules = Object.keys(formConfigMap);

    const moduleUis = {};
    modules.map((module) => {
        moduleUis[module] = {
            arrowDirection: 'down',
            visible: false,
        };
    });

    const directory = {
        path: '',
        isValid: false,
    };

    const dispatch = createEventDispatcher();

    const isPath = (text: string) => {
        let re =
            /^(\/.*|[a-zA-Z]:[\\/](?:([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]|..[\\/])*([^<>:"\/\\|?*]*[^<>:"\/\\|?*.][\\/]?|..[\\/]))?)$/;
        return re.test(text);
    };

    const handlePathInput = (e: Event) => {
        directory.path = (e.target as HTMLInputElement).value;
        directory.isValid = isPath((e.target as HTMLInputElement).value);
    };

    const handleClick = (module: string) => () => {
        if (moduleUis[module].visible) {
            moduleUis[module].arrowDirection = 'down';
            moduleUis[module].visible = false;
        } else {
            moduleUis[module].arrowDirection = 'up';
            moduleUis[module].visible = true;
        }
    };

    const changeDate = (e: Event) => {
        let input = e.target as HTMLInputElement;
        input.style.color = input.value !== '' ? 'black' : '';
    };

    const handleRangeChange = (range: FormRange, property: keyof FormRange) => (e: Event) => {
        let input = e.target as HTMLInputElement;
        input.value = (range.clamp(property, parseFloat(input.value)) ?? '').toString();
    };

    const handleSubmit = () => {
        if (directory.isValid) {
            dispatch('search', {config: formConfigMap, path: directory.path});
        }
    };
</script>

<form on:submit|preventDefault={handleSubmit} autocomplete="off">
    <!-- PATH SECTION -->
    <div class="inputContainer">
        <label
        >Path to directory
            <input
                    type="text"
                    on:input={handlePathInput}
                    bind:value={directory.path}
                    placeholder="C:/images"
                    autocomplete="on"
            />
        </label>
        {#if !(directory.path.length === 0 || directory.isValid)}
            <p class="errorMessage">This is not a valid path</p>
        {/if}
    </div>

    <!-- METADATA SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('metadata')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['metadata']._active}
                    on:click|stopPropagation
            />
            Metadata <i class="arrow {moduleUis['metadata'].arrowDirection}"/>
        </p>
        {#if moduleUis['metadata'].visible && isMetadataConfig(formConfigMap['metadata'])}
            <div class="moduleForm" transition:slide>
                <label class="span2col select"
                >Flash stats
                    <select bind:value={formConfigMap['metadata']._flash}>
                        <option value="">Any</option>
                        {#each flashOptions as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                <label
                >Created after
                    <input
                            type="date"
                            bind:value={formConfigMap['metadata']._dateAfter}
                            on:change={changeDate}
                    />
                </label>
                <label
                >Created before
                    <input
                            type="date"
                            bind:value={formConfigMap['metadata']._dateBefore}
                            on:change={changeDate}
                    />
                </label>
                <div class="fit3col">
                    <label
                    >F-number
                        <input
                                type="number"
                                name="fnumber"
                                bind:value={formConfigMap['metadata']._fNumber}
                                min="0"
                                step="0.01"
                        />
                    </label>
                    <label
                    >Focal length
                        <input
                                type="number"
                                name="focal"
                                bind:value={formConfigMap['metadata']._focalLength}
                                min="0"
                        />
                    </label>
                    <label
                    >Exposure time
                        <input
                                type="number"
                                name="exposure"
                                bind:value={formConfigMap['metadata']._exposureTime}
                                step="0.0001"
                        />
                    </label>
                </div>
                <label
                >Minimal pixel count in X dimension
                    <input
                            type="number"
                            name="minPixelX"
                            bind:value={formConfigMap['metadata']._pixelXDim.min}
                            on:change={handleRangeChange(formConfigMap['metadata']._pixelXDim, 'min')}
                            min="0"
                    />
                </label>
                <label
                >Maximal pixel count in X dimension
                    <input
                            type="number"
                            name="maxPixelX"
                            bind:value={formConfigMap['metadata']._pixelXDim.max}
                            on:change={handleRangeChange(formConfigMap['metadata']._pixelXDim, 'max')}
                            min="0"
                    />
                </label>
                <label
                >Minimal pixel count in Y dimension
                    <input
                            type="number"
                            name="minPixelY"
                            bind:value={formConfigMap['metadata']._pixelYDim.min}
                            on:change={handleRangeChange(formConfigMap['metadata']._pixelYDim, 'min')}
                            min="0"
                    />
                </label>
                <label
                >Maximal pixel count in Y dimension
                    <input
                            type="number"
                            name="maxPixelY"
                            bind:value={formConfigMap['metadata']._pixelYDim.max}
                            on:change={handleRangeChange(formConfigMap['metadata']._pixelYDim, 'max')}
                            min="0"
                    />
                </label>
            </div>
        {/if}
    </div>

    <!-- TEXT SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('text')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['text']._active}
                    on:click|stopPropagation
            />
            Text content <i class="arrow {moduleUis['text'].arrowDirection}"/>
        </p>
        {#if moduleUis['text'].visible && isTextConfig(formConfigMap['text'])}
            <div class="moduleForm" transition:slide>
                <label
                >Has Text
                    <input type="checkbox" bind:checked={formConfigMap['text']._hasText}/>
                </label>
                <label class="span2col"
                >Contains text
                    <input
                            type="text"
                            bind:value={formConfigMap['text']._containsText}
                            placeholder="text"
                            disabled={!formConfigMap['text']._hasText}
                    />
                </label>
                <label class="range"
                >Min text length
                    <input
                            type="number"
                            name="minLength"
                            bind:value={formConfigMap['text']._length.min}
                            on:change={handleRangeChange(formConfigMap['text']._length, 'min')}
                            min="0"
                            disabled={!formConfigMap['text']._hasText}
                    />
                </label>
                <label class="range"
                >Max text length
                    <input
                            type="number"
                            name="maxLength"
                            bind:value={formConfigMap['text']._length.max}
                            on:change={handleRangeChange(formConfigMap['text']._length, 'max')}
                            min="0"
                            disabled={!formConfigMap['text']._hasText}
                    />
                </label>
            </div>
        {/if}
    </div>

    <!-- WEATHER SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('weather')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['weather']._active}
                    on:click|stopPropagation
            />
            Weather conditions <i class="arrow {moduleUis['weather'].arrowDirection}"/>
        </p>
        {#if moduleUis['weather'].visible && isWeatherConfig(formConfigMap['weather'])}
            <div class="moduleForm two2one" transition:slide>
                <label
                >Weather type
                    <select bind:value={formConfigMap['weather']._weather_type}>
                        {#each weatherOptions as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                <label
                >Max prediction offset
                    <input
                            type="number"
                            name="precision"
                            bind:value={formConfigMap['weather']._precision}
                            min="0"
                            max="9"
                            step="1"
                    />
                </label>
            </div>
        {/if}
    </div>

    <!-- PEOPLE SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('people')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['people']._active}
                    on:click|stopPropagation
            />
            People <i class="arrow {moduleUis['people'].arrowDirection}"/>
        </p>
        {#if moduleUis['people'].visible && isPeopleConfig(formConfigMap['people'])}
            <div class="moduleForm" transition:slide>
                <label
                >Has People
                    <input type="checkbox" bind:checked={formConfigMap['people']._hasPeople}/>
                </label>
                <br/>
                <label class="range"
                >Min number of people
                    <input
                            type="number"
                            name="minPeople"
                            bind:value={formConfigMap['people']._count.min}
                            on:change={handleRangeChange(formConfigMap['people']._count, 'min')}
                            min="0"
                            disabled={!formConfigMap['people']._hasPeople}
                    />
                </label>
                <label class="range"
                >Max number of people
                    <input
                            type="number"
                            name="maxPeople"
                            bind:value={formConfigMap['people']._count.max}
                            on:change={handleRangeChange(formConfigMap['people']._count, 'max')}
                            min="0"
                            disabled={!formConfigMap['people']._hasPeople}
                    />
                </label>
            </div>
        {/if}
    </div>

    <!-- FORMAT SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('format')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['format']._active}
                    on:click|stopPropagation
            />
            Format <i class="arrow {moduleUis['format'].arrowDirection}"/>
        </p>
        {#if moduleUis['format'].visible && isFormatConfig(formConfigMap['format'])}
            <div class="moduleForm" transition:slide>
                {#each formConfigMap['format'].allFormats as format}
                    <label>
                        <input type=checkbox
                               bind:group={formConfigMap['format']._selectedFormats} value={format}
                               on:click|stopPropagation>
                        {format}
                    </label>
                {/each}
            </div>
        {/if}
    </div>

    <!-- STYLE SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('style')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['style']._active}
                    on:click|stopPropagation
            />
            Style <i class="arrow {moduleUis['style'].arrowDirection}"/>
        </p>
        {#if moduleUis['style'].visible && isStyleConfig(formConfigMap['style'])}
            <div class="moduleForm" transition:slide>
                {#each formConfigMap['style'].allTypes as style}
                    <label>
                        <input type=checkbox
                               bind:group={formConfigMap['style']._selectedTypes} value={style}
                               on:click|stopPropagation>
                        {style}
                    </label>
                {/each}
            </div>
        {/if}
    </div>

    <!-- BODY SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('body')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['body']._active}
                    on:click|stopPropagation
            />
            Body parts <i class="arrow {moduleUis['body'].arrowDirection}"/>
        </p>
        {#if moduleUis['body'].visible && isBodyConfig(formConfigMap['body'])}
            <div class="moduleForm one" transition:slide>
                <label>
                    <input type=checkbox bind:checked={formConfigMap['body'].faceChecked}>
                    Detect faces
                </label>
                <label>
                    Minimal confidence
                    <input
                            type="number"
                            name="faceConfidence"
                            bind:value={formConfigMap['body']._faceConfidence}
                            min="1"
                            max="100"
                            step="1"
                            disabled={!formConfigMap['body'].faceChecked}/>
                </label>

                <label>
                    <input type=checkbox bind:checked={formConfigMap['body'].handsChecked}>
                    Detect hands
                </label>
                <label>
                    Minimal confidence
                    <input
                            type="number"
                            name="handsConfidence"
                            bind:value={formConfigMap['body']._handsConfidence}
                            min="1"
                            max="100"
                            step="1"
                            disabled={!formConfigMap['body'].handsChecked}/>
                </label>
            </div>
        {/if}
    </div>

    <!-- ANIMAL SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('animal')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['animal']._active}
                    on:click|stopPropagation
            />
            Animal <i class="arrow {moduleUis['animal'].arrowDirection}"/>
        </p>
        {#if moduleUis['animal'].visible && isAnimalConfig(formConfigMap['animal'])}
            <div class="moduleForm two2one" transition:slide>
                <label>
                    Animal species
                    <select bind:value={formConfigMap['animal']._animalSpecies}>
                        {#each animalSpecies as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                <label>
                    Minimal confidence
                    <input
                            type="number"
                            name="confidence"
                            bind:value={formConfigMap['animal']._confidence}
                            min="1"
                            max="100"
                            step="1"/>
                </label>
            </div>
        {/if}
    </div>

    <!-- THINGS SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('things')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['things']._active}
                    on:click|stopPropagation
            />
            Object from another image <i class="arrow {moduleUis['things'].arrowDirection}"/>
        </p>
        {#if moduleUis['things'].visible && isThingsConfig(formConfigMap['things'])}
            <div class="moduleForm oneFull" transition:slide>
                <label>
                    Path to directory
                    <input type="text"
                           on:input={formConfigMap['things'].checkIfValid}
                           bind:value={formConfigMap['things'].imagePath}
                           placeholder="C:/images/image.jpg"
                           autocomplete="on"/>
                </label>
                {#if !(formConfigMap['things'].imagePath.length === 0 || formConfigMap['things'].pathValid)}
                    <p class="errorMessage">This is not a valid path</p>
                {/if}
            </div>
        {/if}
    </div>

    <!-- ANIMAL SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('similarities')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['similarities']._active}
                    on:click|stopPropagation
            />
            Similarities <i class="arrow {moduleUis['similarities'].arrowDirection}"/>
        </p>
        {#if moduleUis['similarities'].visible && isSimilaritiesConfig(formConfigMap['similarities'])}
            <div class="moduleForm two2one" transition:slide>
                <label>
                    Path
                    <input
                            type="text"
                            name="imagePath"
                            bind:value={formConfigMap['similarities'].imagePath}
                    >
                </label>
                <label>
                    Minimal confidence
                    <input
                            type="number"
                            name="confidence"
                            bind:value={formConfigMap['similarities'].confidence}
                            min="1"
                            max="100"
                            step="1"/>
                </label>
            </div>
        {/if}
    </div>

    <!-- Dogs SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('dogs')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['dogs']._active}
                    on:click|stopPropagation
            />
            Dogs <i class="arrow {moduleUis['dogs'].arrowDirection}"/>
        </p>
        {#if moduleUis['dogs'].visible && isDogsConfig(formConfigMap['dogs'])}
            <div class="moduleForm two2one" transition:slide>
                <label>
                    Dogs
                    <select bind:value={formConfigMap['dogs']._dogsSpecies}>
                        {#each dogsSpecies as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
            </div>
        {/if}
    </div>

    <!-- COLORS SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('colors')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['colors']._active}
                    on:click|stopPropagation
            />
            Colors <i class="arrow {moduleUis['colors'].arrowDirection}"/>
        </p>
        {#if moduleUis['colors'].visible && isColorsConfig(formConfigMap['colors'])}
            <div class="moduleForm two2one" transition:slide>
                <!-- color -->
                <label>
                    Color
                    <input type="color" name="color_input" bind:value={formConfigMap['colors']._color}>
                </label>
                <!-- metric -->
                <label>
                    Metric
                    <select bind:value={formConfigMap['colors']._metric}>
                        {#each colorMetrics as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                <!-- comparator -->
                <label class="span2col select">
                    Comparator
                    <select bind:value={formConfigMap['colors']._comparator}>
                        {#each comparatorType as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                <!-- threshold -->
                <label>
                    Threshold
                    <input
                            type="number"
                            name="threshold"
                            bind:value={formConfigMap['colors']._threshold}
                            step="1"/>
                </label>
                <!-- percent_threshold -->
                <label>
                    Percent Threshold
                    <input
                            type="number"
                            name="percent_threshold"
                            bind:value={formConfigMap['colors']._percent_threshold}
                            min="1"
                            max="100"
                            step="1"/>
                </label>
                <!-- tolerance -->
                <label>
                    Tolerance
                    <input
                            type="number"
                            name="tolerance"
                            bind:value={formConfigMap['colors']._tolerance}
                            min="0"
                            max="255"
                            step="1"/>
                </label>

            </div>
        {/if}
    </div>

    <!-- SIZE SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('size')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['size']._active}
                    on:click|stopPropagation
            />
            Size <i class="arrow {moduleUis['size'].arrowDirection}"/>
        </p>
        {#if moduleUis['size'].visible && isSizeConfig(formConfigMap['size'])}
            <div class="moduleForm" transition:slide>
                <label class="span2col select"
                >Unit
                    <select bind:value={formConfigMap['size']._unit}>
                        {#each unitType as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                {#if formConfigMap['size']._unit === 'pixels'}
                    <label
                    >Pixels
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._pixels[0]}
                        />
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._pixels[1]}
                        />
                    </label>
                {/if}
                {#if formConfigMap['size']._unit === 'kb'}
                    <label
                    >Kb
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._kb}
                        />
                    </label>
                {/if}
                {#if formConfigMap['size']._unit === 'cm'}

                    <label
                    >Cm
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._cm[0]}
                        />
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._cm[1]}
                        />
                    </label>
                {/if}
                <label class="span2col select"
                >Comparator
                    <select bind:value={formConfigMap['size']._comparator}>
                        {#each comparatorType as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                {#if formConfigMap['size']._comparator === '=='}
                    <label
                    >threshold
                        <input
                                type="number"
                                bind:value={formConfigMap['size']._threshold}
                        />
                    </label>
                {/if}

            </div>
        {/if}
    </div>

    <!-- METADATA SECTION -->
    <div class="inputContainer">
        <p class="inputContainerTitle" on:click={handleClick('faces')}>
            <input
                    type="checkbox"
                    bind:checked={formConfigMap['faces']._active}
                    on:click|stopPropagation
            />
            Faces <i class="arrow {moduleUis['faces'].arrowDirection}"/>
        </p>
        {#if moduleUis['faces'].visible && isFacesConfig(formConfigMap['faces'])}
            <div class="moduleForm" transition:slide>
                <label class="span2col select"
                >Type
                    <select bind:value={formConfigMap['faces']._type}>
                        {#each facesTypes as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                {#if formConfigMap['faces']._type === 'faces' || formConfigMap['faces']._type === 'faces&smiles'}
                    <label
                    >Number of Faces
                        <input
                                type="number"
                                bind:value={formConfigMap['faces']._noFaces}
                        />
                    </label>
                {/if}

                {#if formConfigMap['faces']._type === 'smiles' || formConfigMap['faces']._type === 'faces&smiles'}

                    <label
                    >Number of Smiles
                        <input
                                type="number"
                                bind:value={formConfigMap['faces']._noSmiles}
                        />
                    </label>
                {/if}
                <label class="span2col select"
                >Comparator
                    <select bind:value={formConfigMap['faces']._comparator}>
                        {#each comparatorType as {value, name}}
                            <option {value}>{name}</option>
                        {/each}
                    </select>
                </label>
                {#if formConfigMap['faces']._comparator === '=='}
                    <label
                    >threshold
                        <input
                                type="number"
                                bind:value={formConfigMap['faces']._threshold}
                        />
                    </label>
                {/if}

            </div>
        {/if}
    </div>


    <!-- SUBMIT SECTION -->
    <div class="submitContainer">
        <input type="submit" value="Search" disabled={!directory.isValid || searching}/>
    </div>
</form>

<style lang="scss">
  label {
    margin-top: 15px;
    display: inline-block;
    width: 100%;
    font-weight: bold;
  }

  input[type='text'],
  input[type='number'],
  input[type='date'],
  select {
    width: 100%;
    padding: 12px 20px;
    margin: 5px 0;
    display: inline-block;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .select {
    display: flex;
    align-items: center;

    select {
      flex-grow: 1;
    }
  }

  input[type='date'] {
    color: rgba(0, 0, 0, 0.3);
  }

  .submitContainer {
    display: flex;
    justify-content: center;
  }

  input[type='submit'] {
    width: 30%;
    background-color: var(--secondary-color);
    color: white;
    padding: 14px 20px;
    margin-top: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type='submit']:hover {
    background-color: #255685;
  }

  input[type='submit']:disabled {
    background-color: #7da3c7;
    cursor: auto;
    color: #eee;
    cursor: not-allowed;
  }

  input::placeholder {
    opacity: 0.3;
  }

  input:focus::placeholder {
    color: transparent;
  }

  .errorMessage {
    margin: 0;
    color: rgb(182, 19, 19);
    font-weight: bold;
  }

  form {
    width: 100%;
    margin: 0 auto;
  }

  .inputContainer {
    margin-top: 10px;
    border-radius: 5px;
    background-color: #f2f2f2;
    padding: 20px 20px;
  }

  .inputContainerTitle {
    margin: 0;
    font-weight: bold;
    color: black;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .moduleForm {
    label {
      flex: 0 1 45%;
    }

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 2rem;
  }

  .moduleForm.two2one {
    grid-template-columns: 2fr 1fr;
  }

  .moduleForm.one {
    grid-template-columns: 1fr;
    width: 50%;
  }

  .moduleForm.oneFull {
    grid-template-columns: 1fr;
  }

  .range .label {
    position: absolute;
    transform: translatey(4px);
    font-size: 0.8rem;
  }

  .span2col {
    grid-column: span 2;

    input[type='number'] {
      width: 25%;
      margin-right: 75%;
    }
  }

  .fit3col {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.5rem 2rem;

    input[type='number'] {
      width: 100%;
    }
  }

  .arrow {
    border: solid black;
    border-width: 0 3px 3px 0;
    display: inline-block;
    padding: 3px;
    margin-left: 3px;
  }

  .up {
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
    margin-left: 6px;
  }

  .down {
    transform: rotate(45deg) translateY(-5px);
    -webkit-transform: rotate(45deg) translateY(-5px);
  }
</style>
