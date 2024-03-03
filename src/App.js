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

const emissions = {
	"wb": 0.05,
	"scooter": 0.25,
	"bus": 0.65,
	"car": 0.75
};

let trips = {};

function calculateEmissions(vehicle,distance) {
	return emissions[vehicle] * distance;
} 

const test = calculateEmissions("car", 100);

export default function App() {
	const [tasks, setTasks] = useState([]);
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

	const taskTitle = useRef('');
	const taskSummary = useRef('');

	const tripDistance = useRef('');
	const transportMode = useRef('');
	const tripEmissions = useRef('');

	function createTask(curDistance,curMode,curEmissions) {
		setTasks([
			...tasks,
			{
				tripDistance: curDistance,
				transportMode: curMode,
				tripEmissions: curEmissions,

				title: "Trip - ",
				emissionsSummary: "CO2 emissions: " + curEmissions + " lbs",
				distanceSummary: "Distance travelled: " + curDistance + " miles", 
				modeSummary: "Mode of Transport: " + curMode,
			},
		]);

		saveTasks([
			...tasks,
			{
				tripDistance: curDistance,
				transportMode: curMode,
				tripEmissions: curEmissions,



				title: "Trip - CO2 emissions: " + curEmissions + "Distance: " + curDistance + "Mode of Transport: " + curMode,
				summary: "Distance: " + curDistance + "Mode of Transport: " + curMode,
			},
		]);
	}

	function deleteTask(index) {
		var clonedTasks = [...tasks];

		clonedTasks.splice(index, 1);

		setTasks(clonedTasks);

		saveTasks([...clonedTasks]);
	}

	function loadTasks() {
		let loadedTasks = localStorage.getItem('tasks');

		let tasks = JSON.parse(loadedTasks);

		if (tasks) {
			setTasks(tasks);
		}
	}

	function saveTasks(tasks) {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	useEffect(() => {
		loadTasks();
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
							ref={taskTitle}
							placeholder={'Distance Travelled'}
							required
							label={'Distance'}
						/>
						<label for="vehicles">Mode of Transport</label>

						<select name="vehicles" id="vehicles">
							<option value="wb">Walking/Bicycle</option>
							<option value="scooter">E-Scooter</option>
							<option value="bus">Bus</option>
							<option value="car">Car</option>
						</select>
						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setOpened(false);
								}}
								variant={'subtle'}>
								Cancel
							</Button>
							<Button
								onClick={() => {
									let dropDown = document.getElementById("vehicles");
									curDistance = document.getElementById("dTravelled").value;
									curMode = dropDown.options[dropDown.selectedIndex].text;
									curEmissions = calculateEmissions(dropDown.value,curDistance);

									createTask(curDistance,curMode,curEmissions);
									setOpened(false);
									totalEmissions += curEmissions;
								}}>
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
								Total emissions: {totalEmissions} lbs/mile
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
						{tasks.length > 0 ? (
							tasks.map((task, index) => {
								if (task.title) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Group position={'apart'}>
												<Text weight={'bold'}>{task.title}</Text>
												<div>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{task.emissionsSummary}</Text>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{task.distanceSummary}</Text>
													<Text color={'dimmed'} size={'md'} mt={'sm'}>{task.modeSummary}</Text>
												</div>
												<ActionIcon
													onClick={() => {
														deleteTask(index);
														totalEmissions -= task.tripEmissions;
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
							mt={'md'}>
							New Trip
						</Button>
					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
