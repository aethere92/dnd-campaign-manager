import { KORINIS_TELEPORTER_C } from './maps/korinis_teleporter_c/index.js';
import { KORINIS_PYRAMID } from './maps/korinis_pyramid/index.js';
import { KORINIS_BANDITS_01 } from './maps/korinis_bandits_01/index.js';
import { KORINIS_SPIDER_CAVE } from './maps/korinis_spider_cave/index.js';
import { KORINIS_ISLAND } from './maps/korinis_island/index.js';
import { FINAL_LOCATION_BEACH_LANDING } from './maps/final_location_beach_landing/index.js';
import { FINNEAS_ENCOUNTER } from './maps/finneas_encounter/index.js';
import { UNNAMED_ISLAND_01 } from './maps/unnamed_island_01/index.js';
import { BONE_WRAITHS_01 } from './maps/bone_wraiths_01/index.js';
import { WORLD_MAPS } from './maps/world_maps/index.js';

export const CAMPAIGN_01 = {
    name: 'Campaign 01',
    maps: {
    [KORINIS_TELEPORTER_C.metadata.mapId]: KORINIS_TELEPORTER_C,
    [KORINIS_PYRAMID.metadata.mapId]: KORINIS_PYRAMID,
    [KORINIS_BANDITS_01.metadata.mapId]: KORINIS_BANDITS_01,
    [KORINIS_SPIDER_CAVE.metadata.mapId]: KORINIS_SPIDER_CAVE,
    [KORINIS_ISLAND.metadata.mapId]: KORINIS_ISLAND,
    [FINAL_LOCATION_BEACH_LANDING.metadata.mapId]: FINAL_LOCATION_BEACH_LANDING,
    [FINNEAS_ENCOUNTER.metadata.mapId]: FINNEAS_ENCOUNTER,
    [UNNAMED_ISLAND_01.metadata.mapId]: UNNAMED_ISLAND_01,
    [BONE_WRAITHS_01.metadata.mapId]: BONE_WRAITHS_01,
    [WORLD_MAPS.metadata.mapId]: WORLD_MAPS
    }
};