/**
 * How was your day?
 * Sentiment rating for the day.
 * @date 2022-Nov-29
 */
import React, {useState, useRef} from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Rating from '@mui/material/Rating';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';

import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

export const customRatingIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: 'Bad day',
  },
  2: {
    icon: <SentimentNeutralIcon color="warning" />,
    label: 'OK day',
  },
  3: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: 'Great day',
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  return <span {...other}>{customRatingIcons[value].icon}</span>;
}

IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
};

export function DayRatingGroup({ rating, setRating, handleDayRatingEvent }) {
  // const { rating, setRating } = props
  return (
    <StyledRating
      name="highlight-selected-only"
      // defaultValue={2}
      max={3}
      size="large"
      value={rating}
      onChange={ (e) => handleDayRatingEvent(e.target.value) }  // TODO: setRating({type: "ModDayRating", value: e.target.value}); rename setRating => dispatchTimeLog ?
      IconContainerComponent={IconContainer}
      getLabelText={(_value) => customRatingIcons[_value].label}
      highlightSelectedOnly
    />
  );
}
