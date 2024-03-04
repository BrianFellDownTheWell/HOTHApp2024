import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	Code,
	Stack
} from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash } from 'tabler-icons-react';
import {
	MantineProvider,
	ColorSchemeProvider,
	ColorScheme,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

let totalEmissions = 0;

let curMode = "";
let curDistance = 0;
let curEmissions = 0;
let curTitle = "";

const emissions = {
	"wb": 0.05,
	"scooter": 0.25,
	"bus": 0.65,
	"car": 0.75
};

function updateEmissions(trips) {
	for (let i = 0; i < trips.length; i++){
			var curTrip = trips[i];
			totalEmissions += curTrip.tripEmissions;
	}
}

function calculateEmissions(vehicle,distance) {
	return emissions[vehicle] * distance;
} 

const test = calculateEmissions("car", 100);

export default function App() {
	const [trips, setTrips] = useState([]);
	const [opened, setOpened] = useState(false);

	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const tripDistance = useRef('');
	const transportMode = useRef('');
	const tripEmissions = useRef('');
	const tripTitle = useRef('');

	function createTrip(curDistance,curMode,curEmissions, curTitle) {
		setTrips([
			...trips,
			{
				tripDistance: curDistance,
				transportMode: curMode,
				tripEmissions: curEmissions,
				tripTitle: curTitle,

				title: curTitle,
				emissionsSummary: "CO2 emissions: " + curEmissions + " lbs",
				distanceSummary: "Distance travelled: " + curDistance + " miles", 
				modeSummary: "Mode of Transport: " + curMode,
			},
		]);

		saveTrips([
			...trips,
			{
				tripDistance: curDistance,
				transportMode: curMode,
				tripEmissions: curEmissions,
				tripTitle: curTitle,

				title: curTitle,
				emissionsSummary: "CO2 emissions: " + curEmissions + " lbs",
				distanceSummary: "Distance travelled: " + curDistance + " miles", 
				modeSummary: "Mode of Transport: " + curMode,
			},
		]);
	}

	function deleteTrip(index) {
		var clonedTrips = [...trips];

		clonedTrips.splice(index, 1);

		setTrips(clonedTrips);

		saveTrips([...clonedTrips]);
	}

	function loadTrips() {
		let loadedTrips = localStorage.getItem('trips');

		let trips = JSON.parse(loadedTrips);

		if (loadedTrips) {
			let trips = JSON.parse(loadedTrips);
			setTrips(trips);
			// console.log(trips);
			// console.log(trips[0].tripEmissions);
			// console.log(trips[1].tripEmissions);
			// console.log(trips[2].tripEmissions);
			updateEmissions(trips);
			// console.log(totalEmissions);
		}
	}

	function saveTrips(trips) {
		localStorage.setItem('trips', JSON.stringify(trips));
	}

	useEffect(() => {
		loadTrips();
	}, []);

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				theme={{ colorScheme, defaultRadius: 'md' }}
				withGlobalStyles
				withNormalizeCSS>
				<div className='App'>
					<Modal
						opened={opened}
						size={'md'}
						title={'New Trip'}
						withCloseButton={false}
						onClose={() => {
							setOpened(false);
						}}
						centered>
						<TextInput
							id="dTravelled"
							mt={'md'}
							ref={tripTitle}
							placeholder={'Distance Travelled, in Miles'}
							label={'Distance'}
						/>
						<TextInput
							id="tripTitle"
							mt={'md'}
							ref={tripTitle}
							placeholder={'Shortly describe your trip'}
							label={'Trip title'}
						/>
						<Stack
							mih={50}
							mt={'md'}
							>

							<Text 
								size='sm' 
								fw={500}
								> Mode of Transport </Text>

							<select name="vehicles" id="vehicles">
								<option value="wb">Walking/Bicycle</option>
								<option value="scooter">E-Scooter</option>
								<option value="bus">Bus</option>
								<option value="car">Car</option>
							</select>
						</Stack>

						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setOpened(false);
								}}
								variant={'subtle'}
								color="green">
								Cancel
							</Button>
							<Button
								onClick={() => {
									let dropDown = document.getElementById("vehicles");
									curDistance = document.getElementById("dTravelled").value;
									curMode = dropDown.options[dropDown.selectedIndex].text;
									curEmissions = calculateEmissions(dropDown.value,curDistance);
									curTitle = document.getElementById("tripTitle").value;

									if(curDistance < 0 ||  isNaN(curDistance) || curDistance == "" || curTitle == "") {
										if(curDistance < 0 ||  isNaN(curDistance) || curDistance == "") {
											alert("Enter a valid distance!");
										}
	
										if(curTitle == "") {
											alert("Enter a Trip Title!");
										}
									}

									else {
										createTrip(curDistance,curMode,curEmissions, curTitle);
										setOpened(false);
										totalEmissions += curEmissions;
									}

									}
								
								}
								color="green">
								Create Trip
							</Button>
						</Group>
					</Modal>
					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								My Trips
							</Title>
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								Total emissions: {totalEmissions} lbs
							</Text>
							<ActionIcon
								color={'blue'}
								onClick={() => toggleColorScheme()}
								size='lg'>
								{colorScheme === 'dark' ? (
									<Sun size={16} />
								) : (
									<MoonStars size={16} />
								)}
							</ActionIcon>
						</Group>
						{trips.length > 0 ? (
							trips.map((trip, index) => {
								if (trip.title) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Group position={'apart'}>
												<Text weight={'bold'}>{trip.title}</Text>
												<div>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{trip.emissionsSummary}</Text>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{trip.distanceSummary}</Text>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{trip.modeSummary}</Text>
												</div>
												<ActionIcon
													onClick={() => {
														deleteTrip(index);
														totalEmissions -= trip.tripEmissions;
													}}
													color={'red'}
													variant={'transparent'}>
													<Trash />
												</ActionIcon>
											</Group>
										</Card>
									);
								}
							})
						) : (
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								You have no trips
							</Text>
						)}
						<Button
							onClick={() => {
								setOpened(true);
							}}
							fullWidth
							mt={'md'}
							color="green">
							New Trip
						</Button>
					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}